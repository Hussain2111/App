import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  profile = signal<{ id: string; username: string; followers_count: number } | null>(null);
  loading = signal(false);
  error = signal('');
  needsConnection = signal(false);

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.error.set('');
    this.needsConnection.set(false);
    this.http.get<{ id: string; username: string; followers_count: number }>('/auth/instagram/profile').subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: (error) => {
        this.profile.set(null);
        this.needsConnection.set(error.status === 404);
        this.error.set(error.status === 404 ? 'Connect your Instagram account to see your followers.' : 'Unable to load your follower count. Please try again.');
        this.loading.set(false);
      },
    });
  }
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }
  period = 'Last 30 days';
  coverage = false;
}
