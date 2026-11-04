import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoStore } from '../demo-store';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  store = inject(DemoStore);
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }
  period = 'Last 30 days';
  coverage = false;
  refresh() {
    this.store.notice.set(
      'Live sync is not connected in this preview. No observations were imported.',
    );
  }
}
