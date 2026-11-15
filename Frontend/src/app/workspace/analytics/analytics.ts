import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import type { InstaPosts } from '../dashboard';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TrendResponse {
  data: {
    id: string;
    name: string;
    period: string;
    values: {
      value: number | null;
      end_time: string;
    }[];
  }[];
}

interface Followers {
  data: {
    id: string;
    name: string;
    period: string;
    title: string;
    description: string;
    total_value: {
      breakdowns: {
        dimension_keys: string[];
        results: {
          dimension_values: string[];
          value: number;
        }[];
      }[];
    };
  }[];
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.html',
  imports: [BaseChartDirective, DatePipe, DecimalPipe],
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  media = signal<InstaPosts[]>([]);
  trend = signal<TrendResponse | null>(null);
  follows = signal<Followers | null>(null);
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  private trendRequest?: Subscription;
  lastUpdated = signal<Date | null>(null);
  metricLabels: Record<string, string> = {
    reach: 'Accounts reached',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comments',
    saves: 'Saves',
    shares: 'Shares',
    total_interactions: 'Total interactions',
  };
  hasMeasurements = computed(
    () => this.trend()?.data[0]?.values.some((point) => point.value !== null) ?? false,
  );
  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    spanGaps: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false } },
    scales: {
      x: {
        title: { display: true, text: 'Interval ending (UTC)' },
        ticks: { maxTicksLimit: 7, maxRotation: 0 },
      },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };
  loading = signal(false);
  error = signal('');
  period = signal('month');
  metric = signal('reach');

  ngOnInit() {
    this.refresh();
    this.loadAudience();
  }

  refresh() {
    this.trendRequest?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.trendRequest = this.http
      .get<TrendResponse>('/api/analytics/trend', {
        params: {
          period: this.period(),
          metric: this.metric(),
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.trend.set(response);
          this.lastUpdated.set(new Date());
          this.loading.set(false);
        },
        error: () => {
          this.trend.set(null);
          this.error.set('Unable to load metric history. Please try again.');
          this.loading.set(false);
        },
      });
    this.http
      .get<Followers>('/api/analytics/followers', {
        params: { period: this.period() },
      })
      .subscribe({
        next: (response) => {
          this.follows.set(response);
        },
      });
    this.http
      .get<{ data: InstaPosts[] }>('/auth/instagram/media', {
        params: { period: this.period() },
      })
      .subscribe({
        next: (response) => {
          this.media.set(response.data);
        },
      });
  }
  chartData = computed<ChartData<'line'>>(() => {
    const series = this.trend()?.data[0];
    const values = series?.values ?? [];

    return {
      labels: values.map((point) => point.end_time.slice(0, 10)),
      datasets: [
        {
          label: this.metricLabels[series?.name ?? this.metric()],
          borderColor: '#315c49',
          backgroundColor: '#315c49',
          pointRadius: 3,
          pointHoverRadius: 5,
          data: values.map((point) => point.value),
        },
      ],
    };
  });

  followerVal() {
    return this.follows()?.data[0]?.total_value.breakdowns[0]?.results.find(
      (result) => result.dimension_values[0] == 'FOLLOWER',
    )?.value;
  }

  unfollowVal() {
    return this.follows()?.data[0]?.total_value.breakdowns[0]?.results.find(
      (result) => result.dimension_values[0] == 'NON_FOLLOWER',
    )?.value;
  }

  netChange() {
    const follows = this.followerVal();
    const unfollows = this.unfollowVal();

    if (follows === undefined || unfollows === undefined) {
      return undefined;
    }

    return follows - unfollows;
  }

  audience = signal('followers');
  demographic = signal('age');
  audienceData = signal<Followers | null>(null);
  audienceLoading = signal(false);
  audienceError = signal('');
  private audienceRequest?: Subscription;
  demographicLabels: Record<string, string> = {
    age: 'Age groups', gender: 'Gender', country: 'Top countries', city: 'Top cities',
  };

  loadAudience() {
    this.audienceRequest?.unsubscribe();
    this.audienceData.set(null);
    this.audienceLoading.set(true);
    this.audienceError.set('');
    this.audienceRequest = this.http.get<Followers>('/api/analytics/audience', {
      params: { audience: this.audience(), breakdown: this.demographic(), period: this.period() },
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.audienceData.set(response);
        this.audienceLoading.set(false);
      },
      error: () => {
        this.audienceError.set('Unable to load this audience breakdown. Please try again.');
        this.audienceLoading.set(false);
      },
    });
  }

  audienceRows = computed(() => {
    const dimension = this.demographic();
    const breakdowns = this.audienceData()?.data?.[0]?.total_value?.breakdowns ?? [];
    const breakdown = breakdowns.find((item) => item.dimension_keys.includes(dimension));
    if (!breakdown) return [];
    const index = breakdown.dimension_keys.indexOf(dimension);
    const rows = breakdown.results
      .filter((item) => item.dimension_values[index] !== undefined && typeof item.value === 'number')
      .map((item) => {
        let label = item.dimension_values[index];
        if (dimension === 'gender') {
          label = ({ M: 'Men', F: 'Women', U: 'Unspecified' } as Record<string, string>)[label] ?? label;
        }
        if (dimension === 'country' && /^[A-Z]{2}$/.test(label)) {
          label = new Intl.DisplayNames(['en'], { type: 'region' }).of(label) ?? label;
        }
        return { label, value: item.value };
      });
    rows.sort((a, b) => dimension === 'age'
      ? a.label.localeCompare(b.label, 'en', { numeric: true }) : b.value - a.value);
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return rows.map((row) => ({ ...row, percent: total > 0 ? row.value / total * 100 : 0 }));
  });

  rankedPosts = computed(() => {
    const selectedMetric = this.metric();
    const metricName = selectedMetric === 'saves' ? 'saved' : selectedMetric;

    return this.media()
      .map((post) => {
        const insight = post.insights.data.find((insight) => insight.name === metricName);

        return {
          post,
          value: insight?.values[0]?.value,
        };
      })
      .sort((a, b) => {
        // Put unavailable measurements last.
        if (a.value === undefined && b.value === undefined) return 0;
        if (a.value === undefined) return 1;
        if (b.value === undefined) return -1;

        return b.value - a.value;
      });
  });
}
