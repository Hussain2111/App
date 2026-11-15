package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/alexedwards/scs/v2"
)

type followerTestTransport func(*http.Request) (*http.Response, error)

func (f followerTestTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

func TestFollowerChangesHandler(t *testing.T) {
	oldManager, oldKey, oldTransport := sessionManager, tokenEncryptionKey, http.DefaultTransport
	t.Cleanup(func() { sessionManager = oldManager; tokenEncryptionKey = oldKey; http.DefaultTransport = oldTransport })
	sessionManager = scs.New()
	tokenEncryptionKey = []byte("01234567890123456789012345678901")
	db, err := sql.Open("sqlite", filepath.Join(t.TempDir(), "followers.db"))
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if _, err := CreateUsersTable(db); err != nil {
		t.Fatal(err)
	}
	if _, err := CreateInstaTable(db); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO users(id,name,email,password) VALUES(1,'Test','test@example.test','unused')`); err != nil {
		t.Fatal(err)
	}
	token, err := Cypher("test-token")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO instagram_connections VALUES(1,'saved-account','creator','business',?)`, token); err != nil {
		t.Fatal(err)
	}
	server := &Server{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /test-session", func(w http.ResponseWriter, r *http.Request) { sessionManager.Put(r.Context(), "userID", int64(1)) })
	mux.HandleFunc("GET /api/analytics/followers", server.handleFollowerCount)
	app := sessionManager.LoadAndSave(mux)
	login := httptest.NewRecorder()
	app.ServeHTTP(login, httptest.NewRequest("POST", "/test-session", nil))
	cookie := login.Result().Cookies()[0]
	expectedDays := 7
	calls := 0
	providerStatus := http.StatusOK
	providerBody := `{"data":[{"name":"follows_and_unfollows","total_value":{"breakdowns":[{"dimension_keys":["follow_type"],"results":[{"dimension_values":["FOLLOWER"],"value":4},{"dimension_values":["NON_FOLLOWER"],"value":15}]}]}}]}`
	http.DefaultTransport = followerTestTransport(func(r *http.Request) (*http.Response, error) {
		calls++
		query := r.URL.Query()
		if r.URL.Path != "/v27.0/saved-account/insights" || query.Get("metric") != "follows_and_unfollows" || query.Get("breakdown") != "follow_type" || query.Get("period") != "day" || query.Get("metric_type") != "total_value" {
			t.Error("wrong account or follower parameters")
		}
		if r.Header.Get("Authorization") != "Bearer test-token" {
			t.Error("saved token not used")
		}
		since, _ := strconv.ParseInt(query.Get("since"), 10, 64)
		until, _ := strconv.ParseInt(query.Get("until"), 10, 64)
		if until-since+1 != int64(expectedDays)*86400 || time.Unix(since, 0).UTC().Hour() != 0 {
			t.Error("incorrect completed-day interval")
		}
		return &http.Response{StatusCode: providerStatus, Body: io.NopCloser(strings.NewReader(providerBody))}, nil
	})
	request := func(period string, signedIn bool, status int) *httptest.ResponseRecorder {
		t.Helper()
		req := httptest.NewRequest("GET", "/api/analytics/followers?period="+period, nil)
		if signedIn {
			req.AddCookie(cookie)
		}
		response := httptest.NewRecorder()
		app.ServeHTTP(response, req)
		if response.Code != status {
			t.Fatalf("period=%s got %d wanted %d: %s", period, response.Code, status, response.Body.String())
		}
		return response
	}
	request("week", false, http.StatusUnauthorized)
	request("recorded", true, http.StatusBadRequest)
	if calls != 0 {
		t.Fatal("invalid requests reached Meta")
	}
	response := request("week", true, http.StatusOK)
	var decoded FollowerChangesResponse
	if err := json.Unmarshal(response.Body.Bytes(), &decoded); err != nil {
		t.Fatal(err)
	}
	results := decoded.Data[0].TotalValue.Breakdowns[0].Results
	if len(results) != 2 || results[0].DimensionValues[0] != "FOLLOWER" || *results[0].Value != 4 || *results[1].Value != 15 {
		t.Fatal("breakdown labels or values lost")
	}
	expectedDays = 30
	request("month", true, http.StatusOK)
	if calls != 2 {
		t.Fatal("each period should use one request")
	}
	providerBody = `{"data":[]}`
	request("month", true, http.StatusOK)
	providerBody = `{}`
	request("month", true, http.StatusBadGateway)
	providerStatus = http.StatusBadRequest
	request("month", true, http.StatusBadGateway)

	t.Run("audience breakdowns", func(t *testing.T) {
		mux.HandleFunc("GET /api/analytics/audience", server.handleAudience)
		expectedMetric, expectedBreakdown, expectedTimeframe := "", "", ""
		body := `{"data":[{"name":"follower_demographics","total_value":{"breakdowns":[{"dimension_keys":["timeframe","age"],"results":[{"dimension_values":["THIS_MONTH","25-34"],"value":12}]}]}}]}`
		status := http.StatusOK
		http.DefaultTransport = followerTestTransport(func(r *http.Request) (*http.Response, error) {
			q := r.URL.Query()
			if q.Get("metric") != expectedMetric || q.Get("breakdown") != expectedBreakdown || q.Get("timeframe") != expectedTimeframe || q.Get("period") != "lifetime" || q.Get("metric_type") != "total_value" || q.Has("since") || q.Has("until") {
				t.Error("wrong audience parameters")
			}
			if r.URL.Path != "/v27.0/saved-account/insights" || r.Header.Get("Authorization") != "Bearer test-token" {
				t.Error("wrong account or token")
			}
			return &http.Response{StatusCode: status, Body: io.NopCloser(strings.NewReader(body))}, nil
		})
		requestAudience := func(query string, signedIn bool, expectedStatus int) {
			t.Helper()
			req := httptest.NewRequest("GET", "/api/analytics/audience?"+query, nil)
			if signedIn {
				req.AddCookie(cookie)
			}
			result := httptest.NewRecorder()
			app.ServeHTTP(result, req)
			if result.Code != expectedStatus {
				t.Fatalf("audience got %d wanted %d: %s", result.Code, expectedStatus, result.Body.String())
			}
			if expectedStatus == http.StatusOK && !json.Valid(result.Body.Bytes()) {
				t.Fatal("invalid audience JSON")
			}
		}
		requestAudience("audience=followers&breakdown=age&period=month", false, http.StatusUnauthorized)
		requestAudience("audience=other&breakdown=age&period=month", true, http.StatusBadRequest)
		requestAudience("audience=followers&breakdown=other&period=month", true, http.StatusBadRequest)
		requestAudience("audience=followers&breakdown=age&period=other", true, http.StatusBadRequest)
		for audience, metric := range map[string]string{"followers": "follower_demographics", "reached": "reached_audience_demographics", "engaged": "engaged_audience_demographics"} {
			expectedMetric = metric
			for _, breakdown := range []string{"age", "gender", "country", "city"} {
				expectedBreakdown = breakdown
				for period, timeframe := range map[string]string{"week": "this_week", "month": "this_month"} {
					expectedTimeframe = timeframe
					requestAudience("audience="+audience+"&breakdown="+breakdown+"&period="+period, true, http.StatusOK)
				}
			}
		}
		expectedMetric, expectedBreakdown, expectedTimeframe = "follower_demographics", "age", "this_month"
		body = `{"data":[]}`
		requestAudience("audience=followers&breakdown=age&period=month", true, http.StatusOK)
		status, body = http.StatusBadRequest, `{"error":{"code":3006}}`
		requestAudience("audience=followers&breakdown=age&period=month", true, http.StatusOK)
		body = `{"error":{"code":100}}`
		requestAudience("audience=followers&breakdown=age&period=month", true, http.StatusBadGateway)
	})

	t.Run("overview totals", func(t *testing.T) {
		mux.HandleFunc("GET /api/analytics/overview", server.handleOverview)
		count := 0
		status := http.StatusOK
		body := `{"data":[{"name":"reach","total_value":{"value":123}},{"name":"views","total_value":{"value":0}}]}`
		http.DefaultTransport = followerTestTransport(func(r *http.Request) (*http.Response, error) {
			count++
			q := r.URL.Query()
			since, _ := strconv.ParseInt(q.Get("since"), 10, 64)
			until, _ := strconv.ParseInt(q.Get("until"), 10, 64)
			if q.Get("metric") != "reach,views,total_interactions" || q.Get("metric_type") != "total_value" || q.Get("period") != "day" || until-since+1 != 30*86400 {
				t.Error("incorrect overview metrics or date range")
			}
			if r.URL.Path != "/v27.0/saved-account/insights" || r.Header.Get("Authorization") != "Bearer test-token" {
				t.Error("wrong saved connection")
			}
			return &http.Response{StatusCode: status, Body: io.NopCloser(strings.NewReader(body))}, nil
		})
		requestOverview := func(signedIn bool) *httptest.ResponseRecorder {
			req := httptest.NewRequest("GET", "/api/analytics/overview", nil)
			if signedIn {
				req.AddCookie(cookie)
			}
			result := httptest.NewRecorder()
			app.ServeHTTP(result, req)
			return result
		}
		if result := requestOverview(false); result.Code != http.StatusUnauthorized || count != 0 {
			t.Fatal("unauthenticated overview reached Meta")
		}
		result := requestOverview(true)
		var summary struct {
			Totals map[string]*int64 `json:"totals"`
			Start  string            `json:"start"`
			End    string            `json:"end"`
		}
		if result.Code != http.StatusOK || json.Unmarshal(result.Body.Bytes(), &summary) != nil {
			t.Fatalf("overview failed: %s", result.Body.String())
		}
		if count != 1 || summary.Totals["reach"] == nil || *summary.Totals["reach"] != 123 || summary.Totals["views"] == nil || *summary.Totals["views"] != 0 || summary.Totals["total_interactions"] != nil || summary.Start == "" || summary.End == "" {
			t.Fatal("period totals, zero or missing value not preserved")
		}
		status, body = http.StatusBadRequest, `{"error":{"code":100}}`
		if result := requestOverview(true); result.Code != http.StatusBadGateway {
			t.Fatal("Meta error not reported")
		}
	})

}
