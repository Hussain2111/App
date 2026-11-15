import { Component, input, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { sampleOpportunities } from './sample-opportunities';

interface OverviewResponse {
  start: string;
  end: string;
  totals: Record<string, number | null>;
}

@Component({
  selector: 'app-overview',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview implements OnInit {
  profile = input<{ id: string; username: string; followers_count: number } | null>(null);
  loading = input(false);
  opportunities = sampleOpportunities;
  performance = signal<OverviewResponse | null>(null);
  performanceLoading = signal(false);
  performanceError = signal('');
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  metricKeys: Record<string, string> = {
    Reach: 'reach', Views: 'views', Engagement: 'total_interactions',
  };

  ngOnInit() {
    this.loadPerformance();
  }

  loadPerformance() {
    this.performanceLoading.set(true);
    this.performanceError.set('');
    this.performance.set(null);
    this.http.get<OverviewResponse>('/api/analytics/overview')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.performance.set(response);
          this.performanceLoading.set(false);
        },
        error: () => {
          this.performanceError.set('Unable to load performance totals. Please try again.');
          this.performanceLoading.set(false);
        },
      });
  }
}
