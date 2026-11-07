package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/alexedwards/scs/sqlite3store"
	"github.com/alexedwards/scs/v2"
	_ "github.com/glebarez/go-sqlite"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type Server struct {
	db *sql.DB
}

type User struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

var sessionManager *scs.SessionManager

func main() {
	db, err := initDB()
	if err != nil {
		log.Println("Error initializing database:", err)
		return
	}
	defer db.Close()

	if _, err := CreateUsersTable(db); err != nil {
		log.Println("Error creating users table:", err)
		return
	}

	if _, err := CreateInstaTable(db); err != nil {
		log.Println("Error creating users table:", err)
		return
	}

	fmt.Println("Users table created successfully")
	if err := CreateSessionsTable(db); err != nil {
		log.Println("Error creating sessions table:", err)
		return
	}

	server := &Server{db: db}

	sessionManager = scs.New()
	sessionManager.Lifetime = 24 * time.Hour
	sessionManager.Cookie.Persist = true
	sessionManager.Cookie.HttpOnly = true
	sessionManager.Cookie.SameSite = http.SameSiteLaxMode
	sessionManager.Cookie.Secure = false // Local development uses HTTP.
	// connect to the database for session storage
	store := sqlite3store.New(db)
	defer store.StopCleanup()
	sessionManager.Store = store

	mux := http.NewServeMux()
	mux.HandleFunc("POST /signin", server.Signin)
	mux.HandleFunc("POST /signup", server.Signup)
	mux.HandleFunc("POST /logout", logOutUser)
	mux.HandleFunc("GET /me", server.getHandler)

	OAuth()
	webhooks := InstagramWebhooks{
		VerifyToken: os.Getenv("META_WEBHOOK_VERIFY_TOKEN"),
		AppSecret:   conf.ClientSecret,
	}
	mux.HandleFunc("GET /webhooks/instagram", webhooks.Verify)
	mux.HandleFunc("POST /webhooks/instagram", webhooks.Receive)
	mux.HandleFunc("GET /auth/instagram/callback", server.Callback)
	mux.HandleFunc("GET /auth/instagram/start", server.Handlestart)
	mux.HandleFunc("GET /auth/instagram/connection", server.HandleConnect)
	mux.HandleFunc("GET /auth/instagram/profile", server.HandleInstagramProfile)

	fmt.Println("Server is running on http://localhost:8080")

	if err := http.ListenAndServe("127.0.0.1:8080", sessionManager.LoadAndSave(mux)); err != nil {
		log.Println("Server error:", err)
	}

}



func (s *Server) getHandler(w http.ResponseWriter, r *http.Request) {
	userID := sessionManager.GetInt64(r.Context(), "userID")
	w.Header().Set("Cache-Control", "no-store")
	if userID == 0 {
		http.Error(w, "Not signed in", http.StatusUnauthorized)
		return
	}

	query := "SELECT id, name, email FROM users WHERE id = ?"
	row := s.db.QueryRowContext(r.Context(), query, userID)

	var user User
	if err := row.Scan(&user.ID, &user.Name, &user.Email); err != nil {
		// error handling if user not found or other database error
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}
		log.Println("Error retrieving user:", err)
		http.Error(w, "Error retrieving user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	}); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}

}

func (s *Server) Signin(w http.ResponseWriter, r *http.Request) {
	var creds User

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	creds.Email = strings.ToLower(strings.TrimSpace(creds.Email))

	if creds.Email == "" || creds.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var storedCreds User

	err := s.db.QueryRow(
		"SELECT id, name, email, password FROM users WHERE email = ?",
		creds.Email,
	).Scan(
		&storedCreds.ID,
		&storedCreds.Name,
		&storedCreds.Email,
		&storedCreds.Password,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		log.Println("Database query error:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(storedCreds.Password),
		[]byte(creds.Password),
	)

	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err = sessionManager.RenewToken(r.Context()); err != nil {
		log.Println("Error renewing session token:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	sessionManager.Put(r.Context(), "userID", storedCreds.ID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    storedCreds.ID,
		"name":  storedCreds.Name,
		"email": storedCreds.Email,
	})
}

func (s *Server) Signup(w http.ResponseWriter, r *http.Request) {
	var creds User

	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	creds.Name = strings.TrimSpace(creds.Name)
	creds.Email = strings.ToLower(strings.TrimSpace(creds.Email))

	if creds.Name == "" || creds.Email == "" || creds.Password == "" {
		http.Error(w, "Name, email and password are required", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(creds.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		http.Error(w, "Invalid password", http.StatusBadRequest)
		return
	}

	res, err := s.db.Exec(
		`INSERT INTO users (name, email, password)
		 VALUES (?, ?, ?)
		 ON CONFLICT(email) DO NOTHING`,
		creds.Name,
		creds.Email,
		string(hashedPassword),
	)

	if err != nil {
		log.Println("Database insert error:", err)
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		http.Error(w, "Error checking registration", http.StatusInternalServerError)
		return
	}

	if rowsAffected == 0 {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	id, err := res.LastInsertId()
	if err != nil {
		http.Error(w, "Error retrieving user ID", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    id,
		"name":  creds.Name,
		"email": creds.Email,
	})
}

func initDB() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "./users.db")
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	fmt.Println("Database opened successfully")
	return db, nil
}

func logOutUser(w http.ResponseWriter, r *http.Request) {
	err := sessionManager.Destroy(r.Context())
	if err != nil {
		log.Println("Error destroying session:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
