package main

import (
	"encoding/json"
	"errors"
	"testing"
	"time"
)

func TestCollectDailyTotals(t *testing.T) {
	start := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)
	for _, days := range []int{7, 30} {
		calls := 0
		points, err := collectDailyTotals("likes", start, start.AddDate(0, 0, days),
			func(since, until time.Time, metricType string) (accountInsightsResponse, error) {
				calls++
				if !until.Equal(since.AddDate(0, 0, 1)) || metricType != "total_value" {
					return accountInsightsResponse{}, errors.New("incorrect daily window or type")
				}
				index := int(since.Sub(start).Hours() / 24)
				body := `{"data":[{"name":"likes","total_value":{"value":12}}]}`
				if index == 0 {
					body = `{"data":[{"name":"likes","total_value":{"value":0}}]}`
				}
				if index == 1 {
					body = `{"data":[]}`
				}
				if index == 2 {
					body = `{"data":[{"name":"likes","total_value":{}}]}`
				}
				var response accountInsightsResponse
				err := json.Unmarshal([]byte(body), &response)
				return response, err
			})
		if err != nil {
			t.Fatal(err)
		}
		if calls != days || len(points) != days {
			t.Fatal("incorrect request/point count")
		}
		if points[0].Value == nil || *points[0].Value != 0 {
			t.Fatal("explicit zero lost")
		}
		if points[1].Value != nil || points[2].Value != nil {
			t.Fatal("missing value converted to zero")
		}
		if points[3].Value == nil || *points[3].Value != 12 {
			t.Fatal("daily total lost")
		}
		for i, point := range points {
			if point.EndTime != start.AddDate(0, 0, i+1).Format(time.RFC3339) {
				t.Fatal("points are out of order")
			}
		}
	}
}

func TestCollectDailyTotalsFailure(t *testing.T) {
	start := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)
	expected := errors.New("provider failed")
	points, err := collectDailyTotals("views", start, start.AddDate(0, 0, 7),
		func(time.Time, time.Time, string) (accountInsightsResponse, error) {
			return accountInsightsResponse{}, expected
		})
	if !errors.Is(err, expected) || points != nil {
		t.Fatal("failed collection reported partial data as complete")
	}
}
