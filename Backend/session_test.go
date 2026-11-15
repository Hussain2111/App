package main

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/alexedwards/scs/sqlite3store"
	"github.com/alexedwards/scs/v2"
)

func TestSessionLifecycle(t *testing.T) {
	previous := sessionManager
	t.Cleanup(func() { sessionManager = previous })
	dbPath := filepath.Join(t.TempDir(), "sessions.db")
	openApp := func() (http.Handler, func()) {
		t.Helper()
		db, err := sql.Open("sqlite", dbPath)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := CreateUsersTable(db); err != nil {
			t.Fatal(err)
		}
		if _, err := CreateInstaTable(db); err != nil {
			t.Fatal(err)
		}
		if err := CreateSessionsTable(db); err != nil {
			t.Fatal(err)
		}
		store := sqlite3store.NewWithCleanupInterval(db, 0)
		sessionManager = scs.New()
		sessionManager.Store = store
		server := &Server{db: db}
		mux := http.NewServeMux()
		mux.HandleFunc("POST /signup", server.Signup)
		mux.HandleFunc("POST /signin", server.Signin)
		mux.HandleFunc("GET /me", server.getHandler)
		mux.HandleFunc("GET /auth/instagram/connection", server.Connect)
		mux.HandleFunc("POST /logout", logOutUser)
		return sessionManager.LoadAndSave(mux), func() { db.Close() }
	}
	app, closeApp := openApp()
	defer func() { closeApp() }()
	request := func(method, path, body string, cookie *http.Cookie, status int) *httptest.ResponseRecorder {
		t.Helper()
		req := httptest.NewRequest(method, path, strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		if cookie != nil {
			req.AddCookie(cookie)
		}
		response := httptest.NewRecorder()
		app.ServeHTTP(response, req)
		if response.Code != status {
			t.Fatalf("%s %s: got %d, want %d: %s", method, path, response.Code, status, response.Body.String())
		}
		return response
	}
	credentials := `{"name":"Session Test","email":"session@example.test","password":"test-password-123"}`
	request("GET", "/me", "", nil, http.StatusUnauthorized)
	request("POST", "/signup", credentials, nil, http.StatusCreated)
	// Seed a saved account link independently of the browser session.
	connectionDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		t.Fatal(err)
	}
	_, err = connectionDB.Exec(`INSERT INTO instagram_connections
		(user_id, instagram_id, username, business_id, encrypted_token)
		SELECT id, 'test-instagram-id', 'test-creator', 'test-business', ?
		FROM users WHERE email = 'session@example.test'`, []byte("test-encrypted-token"))
	connectionDB.Close()
	if err != nil {
		t.Fatal(err)
	}
	request("POST", "/signin", `{"email":"session@example.test","password":"wrong"}`, nil, http.StatusUnauthorized)
	signin := request("POST", "/signin", credentials, nil, http.StatusOK)
	cookies := signin.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatal("sign-in did not set a session cookie")
	}
	cookie := cookies[0]
	if !cookie.HttpOnly {
		t.Fatal("session cookie must be HttpOnly")
	}
	checkMe := func() {
		t.Helper()
		response := request("GET", "/me", "", cookie, http.StatusOK)
		var user map[string]interface{}
		if err := json.Unmarshal(response.Body.Bytes(), &user); err != nil {
			t.Fatal(err)
		}
		if user["email"] != "session@example.test" {
			t.Fatalf("unexpected user: %v", user)
		}
		if _, exists := user["password"]; exists {
			t.Fatal("response exposes password field")
		}
	}
	checkConnection := func() {
		t.Helper()
		response := request("GET", "/auth/instagram/connection", "", cookie, http.StatusOK)
		var connection struct {
			ID       string `json:"insta_ID"`
			Username string `json:"username"`
		}
		if err := json.Unmarshal(response.Body.Bytes(), &connection); err != nil {
			t.Fatal(err)
		}
		if connection.ID != "test-instagram-id" || connection.Username != "test-creator" {
			t.Fatalf("saved Instagram connection changed: %v", connection)
		}
	}
	checkMe()
	checkConnection()
	// Losing the browser cookie requires sign-in, while the account link stays saved.
	request("GET", "/auth/instagram/connection", "", nil, http.StatusUnauthorized)
	// Reopen the database with a new manager to simulate a backend restart.
	closeApp()
	app, closeApp = openApp()
	checkMe()
	checkConnection()
	request("POST", "/logout", "", cookie, http.StatusOK)
	// Even replaying the old cookie must fail after logout.
	request("GET", "/me", "", cookie, http.StatusUnauthorized)
	request("GET", "/auth/instagram/connection", "", cookie, http.StatusUnauthorized)
	signin = request("POST", "/signin", credentials, nil, http.StatusOK)
	cookie = signin.Result().Cookies()[0]
	checkConnection()
	request("GET", "/logout", "", nil, http.StatusMethodNotAllowed)
}
