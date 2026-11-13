import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { sampleOpportunities } from './sample-opportunities';

@Component({
  selector: 'app-overview',
  imports: [RouterLink],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  profile = input<{ id: string; username: string; followers_count: number } | null>(null);
  loading = input(false);
  opportunities = sampleOpportunities;
}
