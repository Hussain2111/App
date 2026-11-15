package main

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

type TrendPoint struct {
	Value   *int64 `json:"value"`
	EndTime string `json:"end_time"`
}

type Trend struct {
	ID     string       `json:"id,omitempty"`
	Metric string       `json:"name"`
	Period string       `json:"period"`
	Values []TrendPoint `json:"values"`
}

type TrendResponse struct {
	Data []Trend `json:"data"`
}

type accountInsightsResponse struct {
	Data []struct {
		ID         string       `json:"id"`
		Name       string       `json:"name"`
		Period     string       `json:"period"`
		Values     []TrendPoint `json:"values"`
		TotalValue *struct {
			Value *int64 `json:"value"`
		} `json:"total_value"`
	} `json:"data"`
}

func (s *Server) handleMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	period := r.URL.Query().Get("period")
	metric := r.URL.Query().Get("metric")
	days := 7
	switch period {
	case "week":
	case "month":
		days = 30
	default:
		http.Error(w, "Period must be week or month", http.StatusBadRequest)
		return
	}
	switch metric {
	case "reach", "views", "likes", "comments", "saves", "shares", "total_interactions":
	default:
		http.Error(w, "Unsupported metric", http.StatusBadRequest)
		return
	}

	// Use completed UTC days so a partial day is not compared with a full day.
	now := time.Now().UTC()
	end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, 0, -days)
	ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
	defer cancel()
	r = r.WithContext(ctx)
	fetch := func(start, end time.Time, metricType string) (accountInsightsResponse, error) {
		return s.fetchAccountInsights(w, r, metric, metricType, start, end)
	}

	trend := Trend{Metric: metric, Period: "day", Values: []TrendPoint{}}
	if metric == "reach" {
		response, err := fetch(start, end, "time_series")
		if err != nil {
			writeInstagramError(w, err)
			return
		}
		for _, item := range response.Data {
			if item.Name == metric {
				trend.ID = item.ID
				if item.Values != nil {
					trend.Values = item.Values
				}
				break
			}
		}
	} else {
		var err error
		trend.Values, err = collectDailyTotals(metric, start, end, fetch)
		if err != nil {
			writeInstagramError(w, err)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TrendResponse{Data: []Trend{trend}})
}

// Request each daily total in order. Missing values remain null gaps.
func collectDailyTotals(metric string, start, end time.Time,
	fetch func(time.Time, time.Time, string) (accountInsightsResponse, error),
) ([]TrendPoint, error) {
	points := []TrendPoint{}
	for day := start; day.Before(end); day = day.AddDate(0, 0, 1) {
		next := day.AddDate(0, 0, 1)
		response, err := fetch(day, next, "total_value")
		if err != nil {
			return nil, err
		}
		point := TrendPoint{EndTime: next.Format(time.RFC3339)}
		for _, item := range response.Data {
			if item.Name == metric && item.TotalValue != nil {
				point.Value = item.TotalValue.Value
				break
			}
		}
		points = append(points, point)
	}
	return points, nil
}

func (s *Server) fetchAccountInsights(w http.ResponseWriter, r *http.Request,
	metric, metricType string, start, end time.Time,
) (accountInsightsResponse, error) {
	var result accountInsightsResponse
	params := url.Values{}
	params.Set("metric", metric)
	params.Set("period", "day")
	params.Set("metric_type", metricType)
	params.Set("since", strconv.FormatInt(start.Unix(), 10))
	// Meta documents inclusive boundaries. Exclude the next day's first second.
	params.Set("until", strconv.FormatInt(end.Add(-time.Second).Unix(), 10))
	resp, _, err := s.helper(w, r, "/insights?"+params.Encode(), "")
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		var failure struct {
			Error struct {
				Type    string `json:"type"`
				Code    int    `json:"code"`
				Subcode int    `json:"error_subcode"`
			} `json:"error"`
		}
		json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&failure)
		log.Printf("Instagram account insights: metric=%s metric_type=%s http=%d type=%s code=%d subcode=%d",
			metric, metricType, resp.StatusCode, failure.Error.Type, failure.Error.Code, failure.Error.Subcode)
		return result, errors.New("Instagram account insights request failed")
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&result); err != nil {
		return result, err
	}
	return result, nil
}

type FollowerChangesResponse struct {
	Data []struct {
		Name       string `json:"name"`
		TotalValue struct {
			Breakdowns []struct {
				DimensionKeys []string `json:"dimension_keys"`
				Results       []struct {
					DimensionValues []string `json:"dimension_values"`
					Value           *int64   `json:"value"`
				} `json:"results"`
			} `json:"breakdowns"`
		} `json:"total_value"`
	} `json:"data"`
}

func (s *Server) handleFollowerCount(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	days := 7
	switch r.URL.Query().Get("period") {
	case "week":
	case "month":
		days = 30
	default:
		http.Error(w, "Period must be week or month", http.StatusBadRequest)
		return
	}
	now := time.Now().UTC()
	end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, 0, -days)
	params := url.Values{}
	params.Set("metric", "follows_and_unfollows")
	params.Set("period", "day")
	params.Set("metric_type", "total_value")
	params.Set("breakdown", "follow_type")
	params.Set("since", strconv.FormatInt(start.Unix(), 10))
	params.Set("until", strconv.FormatInt(end.Add(-time.Second).Unix(), 10))

	resp, _, err := s.helper(w, r, "/insights?"+params.Encode(), "")
	if err != nil {
		writeInstagramError(w, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Instagram could not return follower changes. Please try again.", http.StatusBadGateway)
		return
	}
	var followers FollowerChangesResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&followers); err != nil || followers.Data == nil {
		http.Error(w, "Instagram returned an incomplete follower response", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(followers)
}

// Demographics use the same nested breakdown structure as follower changes.
func (s *Server) handleAudience(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	metric := ""
	switch r.URL.Query().Get("audience") {
	case "followers":
		metric = "follower_demographics"
	case "reached":
		metric = "reached_audience_demographics"
	case "engaged":
		metric = "engaged_audience_demographics"
	default:
		http.Error(w, "Unsupported audience", http.StatusBadRequest)
		return
	}
	breakdown := r.URL.Query().Get("breakdown")
	switch breakdown {
	case "age", "gender", "country", "city":
	default:
		http.Error(w, "Unsupported demographic", http.StatusBadRequest)
		return
	}
	timeframe := ""
	switch r.URL.Query().Get("period") {
	case "week":
		timeframe = "this_week"
	case "month":
		timeframe = "this_month"
	default:
		http.Error(w, "Period must be week or month", http.StatusBadRequest)
		return
	}
	params := url.Values{}
	params.Set("metric", metric)
	params.Set("period", "lifetime")
	params.Set("metric_type", "total_value")
	params.Set("breakdown", breakdown)
	params.Set("timeframe", timeframe)
	resp, _, err := s.helper(w, r, "/insights?"+params.Encode(), "")
	if err != nil {
		writeInstagramError(w, err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		var failure struct {
			Error struct {
				Code int `json:"code"`
			} `json:"error"`
		}
		json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&failure)
		if failure.Error.Code == 3006 {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(FollowerChangesResponse{Data: nil})
			return
		}
		log.Printf("Instagram demographics: metric=%s breakdown=%s http=%d code=%d", metric, breakdown, resp.StatusCode, failure.Error.Code)
		http.Error(w, "Instagram could not return this audience breakdown. Try again later.", http.StatusBadGateway)
		return
	}
	var result FollowerChangesResponse
	if err := json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(&result); err != nil || result.Data == nil {
		http.Error(w, "Instagram returned an incomplete audience response", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Overview needs period totals, including deduplicated reach, rather than daily sums.
func (s *Server) handleOverview(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	now := time.Now().UTC()
	end := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	start := end.AddDate(0, 0, -30)
	response, err := s.fetchAccountInsights(w, r, "reach,views,total_interactions", "total_value", start, end)
	if err != nil {
		writeInstagramError(w, err)
		return
	}
	totals := map[string]*int64{"reach": nil, "views": nil, "total_interactions": nil}
	for _, item := range response.Data {
		if _, wanted := totals[item.Name]; wanted && item.TotalValue != nil {
			totals[item.Name] = item.TotalValue.Value
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(struct {
		Start  string            `json:"start"`
		End    string            `json:"end"`
		Totals map[string]*int64 `json:"totals"`
	}{
		Start:  start.Format("2006-01-02"),
		End:    end.AddDate(0, 0, -1).Format("2006-01-02"),
		Totals: totals,
	})
}
