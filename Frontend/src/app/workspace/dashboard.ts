import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Overview } from './overview/overview';
import { Analytics } from './analytics/analytics';
import { ProfileAudit } from './profile-audit/profile-audit';

interface InstaPosts {
  id: string;
  caption: string;
  media_type: string;
  timestamp: string;
  permalink: string;
  insights: [];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Overview, Analytics, ProfileAudit],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  profile = signal<{ id: string; username: string; followers_count: number } | null>(null);
  media = signal<InstaPosts[]>([]);
  loading = signal(false);
  error = signal('');
  needsConnection = signal(false);
  needsPosts = signal(false);
  mediaLoading = signal(false);
  mediaError = signal('');

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.error.set('');
    this.needsConnection.set(false);
    this.mediaLoading.set(true);
    this.mediaError.set('');
    this.needsPosts.set(false);
    this.http
      .get<{ id: string; username: string; followers_count: number }>('/auth/instagram/profile')
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.loading.set(false);
        },
        error: (error) => {
          this.profile.set(null);
          this.needsConnection.set(error.status === 404);
          this.error.set(
            error.status === 404
              ? 'Connect your Instagram account to see your followers.'
              : 'Unable to load your follower count. Please try again.',
          );
          this.loading.set(false);
        },
      });
    this.http.get<{ data: InstaPosts[] }>('/auth/instagram/media').subscribe({
      next: (response) => {
        this.media.set(response.data);
        this.mediaLoading.set(false);
      },
      error: (error) => {
        this.media.set([]);
        this.needsPosts.set(error.status === 404);
        this.mediaError.set(
          error.status === 404
            ? 'Connect your Instagram account to see your posts.'
            : 'Unable to load your posts. Please try again.',
        );
        this.mediaLoading.set(false);
      },
    });
  }
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }
}
