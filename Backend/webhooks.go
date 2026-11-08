package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"
)

// InstagramWebhooks receives Meta verification requests and signed notifications.
// It deliberately does not require a Trellis browser session.
type InstagramWebhooks struct {
	VerifyToken string
	AppSecret   string
}

func (h InstagramWebhooks) Verify(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	if h.VerifyToken == "" {
		http.Error(w, "Webhook verify token is not configured", http.StatusServiceUnavailable)
		return
	}
	query := r.URL.Query()
	if query.Get("hub.mode") != "subscribe" || query.Get("hub.challenge") == "" ||
		!hmac.Equal([]byte(query.Get("hub.verify_token")), []byte(h.VerifyToken)) {
		http.Error(w, "Webhook verification failed", http.StatusForbidden)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	io.WriteString(w, query.Get("hub.challenge"))
}

func (h InstagramWebhooks) Receive(w http.ResponseWriter, r *http.Request) {
	if h.AppSecret == "" {
		http.Error(w, "Webhook app secret is not configured", http.StatusServiceUnavailable)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	defer r.Body.Close()
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Unable to read webhook body", http.StatusBadRequest)
		return
	}
	signature, hasPrefix := strings.CutPrefix(r.Header.Get("X-Hub-Signature-256"), "sha256=")
	provided, err := hex.DecodeString(signature)
	mac := hmac.New(sha256.New, []byte(h.AppSecret))
	mac.Write(body)
	if !hasPrefix || err != nil || !hmac.Equal(provided, mac.Sum(nil)) {
		http.Error(w, "Invalid webhook signature", http.StatusForbidden)
		return
	}
	var event struct {
		Object string            `json:"object"`
		Entry  []json.RawMessage `json:"entry"`
	}
	if err := json.Unmarshal(body, &event); err != nil {
		http.Error(w, "Invalid webhook JSON", http.StatusBadRequest)
		return
	}
	if event.Object != "instagram" {
		http.Error(w, "Unsupported webhook object", http.StatusBadRequest)
		return
	}
	// This sprint only verifies delivery; event processing is not implemented.
	// Do not log message contents, access tokens, or other personal event data.
	log.Printf("Instagram webhook received: %d entries (signature verified)", len(event.Entry))
	w.WriteHeader(http.StatusOK)
}
