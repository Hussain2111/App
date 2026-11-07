package main

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/json"
	"golang.org/x/oauth2"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

var conf *oauth2.Config

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

	if sessionManager.GetInt64(ctx, "userID") == 0 {
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

	// Temporary diagnostic output: no token or app secret.
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"client_business_id": business.ClientBusinessID,
		"account_count":      len(accounts.Data),
		"accounts":           accounts.Data,
	})
	return

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
