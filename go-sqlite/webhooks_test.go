package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWebhookVerification(t *testing.T) {
	for _, tc := range []struct {
		name, configured, query string
		status                  int
	}{
		{"valid", "test-token", "hub.mode=subscribe&hub.verify_token=test-token&hub.challenge=12345", 200},
		{"wrong token", "test-token", "hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345", 403},
		{"wrong mode", "test-token", "hub.mode=other&hub.verify_token=test-token&hub.challenge=12345", 403},
		{"missing challenge", "test-token", "hub.mode=subscribe&hub.verify_token=test-token", 403},
		{"unconfigured", "", "hub.mode=subscribe&hub.verify_token=&hub.challenge=12345", 503},
	} {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			InstagramWebhooks{VerifyToken: tc.configured}.Verify(w, httptest.NewRequest("GET", "/webhooks/instagram?"+tc.query, nil))
			if w.Code != tc.status {
				t.Fatalf("status = %d, want %d", w.Code, tc.status)
			}
			if tc.status == 200 && w.Body.String() != "12345" {
				t.Fatalf("challenge was not returned verbatim: %q", w.Body.String())
			}
		})
	}
}

func TestWebhookNotifications(t *testing.T) {
	const body = `{"object":"instagram","entry":[{"id":"test-account"}]}`
	sign := func(body string) string {
		mac := hmac.New(sha256.New, []byte("test-secret"))
		mac.Write([]byte(body))
		return "sha256=" + hex.EncodeToString(mac.Sum(nil))
	}
	for _, tc := range []struct {
		name, body, signature, secret string
		status                        int
	}{
		{"valid", body, sign(body), "test-secret", 200},
		{"missing signature", body, "", "test-secret", 403},
		{"malformed signature", body, "sha256=xyz", "test-secret", 403},
		{"tampered body", body + " ", sign(body), "test-secret", 403},
		{"wrong secret", body, sign(body), "other-secret", 403},
		{"invalid JSON", "{", sign("{"), "test-secret", 400},
		{"other object", `{"object":"page"}`, sign(`{"object":"page"}`), "test-secret", 400},
		{"unconfigured", body, sign(body), "", 503},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPost, "/webhooks/instagram", strings.NewReader(tc.body))
			r.Header.Set("X-Hub-Signature-256", tc.signature)
			w := httptest.NewRecorder()
			InstagramWebhooks{AppSecret: tc.secret}.Receive(w, r)
			if w.Code != tc.status {
				t.Fatalf("status = %d, want %d", w.Code, tc.status)
			}
		})
	}
}
