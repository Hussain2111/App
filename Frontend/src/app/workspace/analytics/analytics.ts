import { Component } from '@angular/core';
import { Dashboard } from '../dashboard';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.html',
})
export class Analytics {
  period = 'Last 30 days';
  coverage = false;
}
