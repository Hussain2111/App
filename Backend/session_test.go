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
	checkMe()
	// Reopen the database with a new manager to simulate a backend restart.
	closeApp()
	app, closeApp = openApp()
	checkMe()
	request("POST", "/logout", "", cookie, http.StatusOK)
	// Even replaying the old cookie must fail after logout.
	request("GET", "/me", "", cookie, http.StatusUnauthorized)
	request("GET", "/logout", "", nil, http.StatusMethodNotAllowed)
}
