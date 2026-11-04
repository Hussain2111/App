import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'overview';
  }
  period = 'Last 30 days';
  coverage = false;
}
