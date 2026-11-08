package main

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"encoding/json"
	"errors"
	"golang.org/x/oauth2"

	"encoding/hex"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

var conf *oauth2.Config

var tokenEncryptionKey []byte

func loadTokenEncryptionKey() error {
	key, err := hex.DecodeString(os.Getenv("TOKEN_ENCRYPTION_KEY"))
	if err != nil {
		return errors.New("TOKEN_ENCRYPTION_KEY must contain valid hexadecimal")
	}
	if len(key) != 32 {
		return errors.New("TOKEN_ENCRYPTION_KEY must decode to 32 bytes")
	}

	tokenEncryptionKey = key
	return nil
}

func OAuth() {
	conf = &oauth2.Config{
		ClientID:     "1645303623814124",
		ClientSecret: os.Getenv("META_APP_SECRET"),
		RedirectURL:  "https://lunar-disown-heaving.ngrok-free.dev/auth/instagram/callback",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://www.facebook.com/dialog/oauth",
			TokenURL: "https://graph.facebook.com/v27.0/oauth/access_token",
		},
	}
}

func (s *Server) Callback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	w.Header().Set("Cache-Control", "no-store")
	user := sessionManager.GetInt64(ctx, "userID")
	if user == 0 {
		http.Error(w, "Not signed in", http.StatusUnauthorized)
		return
	}

	returnedState := r.URL.Query().Get("state")
	expectedState := sessionManager.GetString(ctx, "instagramState")
	expires := sessionManager.GetInt64(ctx, "instagramStateExpires")

	if returnedState == "" || expectedState == "" ||
		subtle.ConstantTimeCompare([]byte(returnedState), []byte(expectedState)) != 1 {
		http.Error(w, "Invalid OAuth state", http.StatusBadRequest)
		return
	}

	sessionManager.Remove(ctx, "instagramState")
	sessionManager.Remove(ctx, "instagramStateExpires")
	returnTo := sessionManager.GetString(ctx, "instagramReturnTo")
	sessionManager.Remove(ctx, "instagramReturnTo")

	if expires == 0 || time.Now().Unix() >= expires {
		http.Error(w, "Authorization expired; please try again", http.StatusBadRequest)
		return
	}

	if r.URL.Query().Get("error") != "" {
		http.Error(w, "Instagram authorization was not completed", http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Authorization code missing", http.StatusBadRequest)
		return
	}

	if conf == nil || conf.ClientSecret == "" || conf.Endpoint.TokenURL == "" {
		http.Error(w, "Instagram OAuth is not configured", http.StatusServiceUnavailable)
		return
	}

	exchangeCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	tokenURL, err := url.Parse(conf.Endpoint.TokenURL)
	if err != nil {
		http.Error(w, "Invalid token endpoint", http.StatusInternalServerError)
		return
	}

	params := tokenURL.Query()
	params.Set("client_id", conf.ClientID)
	params.Set("client_secret", conf.ClientSecret)
	params.Set("code", code)
	params.Set("redirect_uri", conf.RedirectURL)
	tokenURL.RawQuery = params.Encode()

	req, err := http.NewRequestWithContext(
		exchangeCtx,
		http.MethodGet,
		tokenURL.String(),
		nil,
	)

	if err != nil {
		http.Error(w, "Unable to create token request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Accept", "application/json")

	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Instagram token request failed", http.StatusBadGateway)
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Instagram token exchange failed", http.StatusBadGateway)
		return
	}

	var token struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int64  `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		http.Error(w, "Invalid token response", http.StatusBadGateway)
		return
	}

	if token.AccessToken == "" {
		http.Error(w, "Access token missing", http.StatusBadGateway)
		return
	}

	var accounts struct {
		Data []struct {
			ID       string `json:"id"`
			Username string `json:"username"`
		} `json:"data"`
	}

	lookupCtx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	accountURL, err := url.Parse("https://graph.facebook.com/v27.0/me/assigned_instagram_accounts")
	if err != nil {
		http.Error(w, "Invalid account endpoint", http.StatusInternalServerError)
		return
	}
	val := accountURL.Query()
	val.Set("fields", "id,username")
	val.Set("access_token", token.AccessToken)
	accountURL.RawQuery = val.Encode()

	request, err := http.NewRequestWithContext(
		lookupCtx,
		http.MethodGet,
		accountURL.String(),
		nil,
	)

	if err != nil {
		http.Error(w, "Unable to lookup account", http.StatusInternalServerError)
		return
	}

	request.Header.Set("Accept", "application/json")

	response, err := client.Do(request)
	if err != nil {
		http.Error(w, "Instagram account lookup failed", http.StatusBadGateway)
		return
	}

	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		http.Error(w, "Instagram account lookup failed", http.StatusBadGateway)
		return
	}

	var accountPayload struct {
		Data json.RawMessage `json:"data"`
	}

	if err := json.NewDecoder(response.Body).Decode(&accountPayload); err != nil {
		http.Error(w, "Invalid account response", http.StatusBadGateway)
		return
	}

	if len(accountPayload.Data) == 0 {
		http.Error(w, "Meta response did not contain a data field", http.StatusBadGateway)
		return
	}

	if err := json.Unmarshal(accountPayload.Data, &accounts.Data); err != nil {
		http.Error(w, "Invalid account list", http.StatusBadGateway)
		return
	}

	businessCtx, cancelBusiness := context.WithTimeout(ctx, 15*time.Second)
	defer cancelBusiness()

	businessURL, err := url.Parse("https://graph.facebook.com/v27.0/me")
	if err != nil {
		http.Error(w, "Invalid business endpoint", http.StatusInternalServerError)
		return
	}

	query := businessURL.Query()
	query.Set("fields", "client_business_id")
	query.Set("access_token", token.AccessToken)
	businessURL.RawQuery = query.Encode()

	businessRequest, err := http.NewRequestWithContext(
		businessCtx,
		http.MethodGet,
		businessURL.String(),
		nil,
	)
	if err != nil {
		http.Error(w, "Unable to create business request", http.StatusInternalServerError)
		return
	}

	businessResponse, err := client.Do(businessRequest)
	if err != nil {
		http.Error(w, "Business lookup failed", http.StatusBadGateway)
		return
	}
	defer businessResponse.Body.Close()

	if businessResponse.StatusCode != http.StatusOK {
		http.Error(w, "Meta rejected the business lookup", http.StatusBadGateway)
		return
	}

	var business struct {
		ClientBusinessID string `json:"client_business_id"`
		ID               string `json:"id"`
	}

	if err := json.NewDecoder(io.LimitReader(businessResponse.Body, 1<<20)).
		Decode(&business); err != nil {
		http.Error(w, "Invalid business response", http.StatusBadGateway)
		return
	}

	cyphertext, err := cypher(token.AccessToken)
	if err != nil {
		http.Error(w, "Token encryption failed", http.StatusInternalServerError)
		return
	}

	DBquery := `
    INSERT INTO instagram_connections
        (user_id, instagram_id, username, business_id, encrypted_token)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(instagram_id) DO UPDATE SET
        username = excluded.username,
        business_id = excluded.business_id,
        encrypted_token = excluded.encrypted_token
    WHERE instagram_connections.user_id = excluded.user_id;`
	if len(accounts.Data) == 0 {
		http.Error(w, "No Instagram account returned", http.StatusBadGateway)
		return
	}

	instagramID := accounts.Data[0].ID
	accountUsername := accounts.Data[0].Username
	result, err := s.db.Exec(
		DBquery, user, instagramID, accountUsername,
		business.ClientBusinessID, cyphertext,
	)
	if err != nil {
		http.Error(w, "Failed to save Instagram connection", http.StatusInternalServerError)
		return
	}

	rows, err := result.RowsAffected()
	if err != nil {
		http.Error(w, "Failed to confirm saved connection", http.StatusInternalServerError)
		return
	}
	if rows == 0 {
		http.Error(w, "Instagram account is connected to another user", http.StatusConflict)
		return
	}

	if returnTo == "/dashboard" {
		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
		return
	}
	http.Redirect(w, r, "/step2", http.StatusSeeOther)

}

func cypher(token string) ([]byte, error) {
	key := []byte(tokenEncryptionKey)
	plaintext := []byte(token)

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func (s *Server) Handlestart(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	w.Header().Set("Cache-Control", "no-store")

	if sessionManager.GetInt64(ctx, "userID") == 0 {
		http.Error(w, "Not signed in", http.StatusUnauthorized)
		return
	}

	if conf == nil || conf.ClientSecret == "" || conf.Endpoint.TokenURL == "" {
		http.Error(w, "Instagram OAuth is not configured", http.StatusServiceUnavailable)
		return
	}

	state := rand.Text()
	sessionManager.Remove(ctx, "instagramReturnTo")
	if r.URL.Query().Get("return_to") == "/dashboard" {
		sessionManager.Put(ctx, "instagramReturnTo", "/dashboard")
	}
	sessionManager.Put(r.Context(), "instagramState", state)
	sessionManager.Put(ctx, "instagramStateExpires", time.Now().Add(10*time.Minute).Unix())

	url := conf.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("config_id", "1131336323191876"),
		oauth2.SetAuthURLParam("override_default_response_type", "true"),
		oauth2.SetAuthURLParam("prompt", "login"),
	)

	http.Redirect(w, r, url, http.StatusSeeOther)
}

func (s *Server) HandleConnect(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	user := sessionManager.GetInt64(ctx, "userID")
	if user == 0 {
		http.Error(w, "Not signed in", http.StatusUnauthorized)
		return
	}
	var instaID string
	var username string
	query := `SELECT instagram_id, username 
	FROM instagram_connections WHERE user_id = ?;`

	if err := s.db.QueryRowContext(ctx, query, user).Scan(&instaID, &username); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			http.Error(w, "No Instagram connection found", http.StatusNotFound)
			return
		}

		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(map[string]interface{}{
		"insta_ID": instaID,
		"username": username,
	}); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

func (s *Server) HandleInstagramProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	userID := sessionManager.GetInt64(r.Context(), "userID")
	if userID == 0 {
		http.Error(w, "Not signed in", http.StatusUnauthorized)
		return
	}
	var instagramID string
	var encryptedToken []byte
	err := s.db.QueryRowContext(r.Context(),
		"SELECT instagram_id, encrypted_token FROM instagram_connections WHERE user_id = ?", userID,
	).Scan(&instagramID, &encryptedToken)
	if errors.Is(err, sql.ErrNoRows) {
		http.Error(w, "No Instagram connection found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Unable to load Instagram connection", http.StatusInternalServerError)
		return
	}
	block, err := aes.NewCipher(tokenEncryptionKey)
	if err != nil {
		http.Error(w, "Unable to initialize token decryption", http.StatusInternalServerError)
		return
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil || len(encryptedToken) < gcm.NonceSize()+gcm.Overhead() {
		http.Error(w, "Invalid stored token", http.StatusInternalServerError)
		return
	}
	nonce := encryptedToken[:gcm.NonceSize()]
	token, err := gcm.Open(nil, nonce, encryptedToken[gcm.NonceSize():], nil)
	if err != nil {
		http.Error(w, "Unable to decrypt Instagram token", http.StatusInternalServerError)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	endpoint := "https://graph.facebook.com/v27.0/" + url.PathEscape(instagramID) + "?fields=id,username,followers_count"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		http.Error(w, "Unable to create Instagram request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Authorization", "Bearer "+string(token))
	client := &http.Client{CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Unable to reach Instagram", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Instagram could not return the follower count. Try reconnecting your account.", http.StatusBadGateway)
		return
	}
	var profile struct {
		ID             string `json:"id"`
		Username       string `json:"username"`
		FollowersCount *int64 `json:"followers_count"`
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&profile); err != nil || profile.ID != instagramID || profile.FollowersCount == nil {
		http.Error(w, "Instagram returned an incomplete profile", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}
