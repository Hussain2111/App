import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-planner',
  imports: [RouterLink, FormsModule],
  templateUrl: './planner.html',
})
export class Planner {
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'calendar';
  }
  draft = { hook: '', caption: '', cta: '', hashtags: '', format: 'Carousel', date: '' };
  confirmed = false;
  selected = 1;
  week = false;
  month = new Date(2026, 9, 1);
  get monthLabel() {
    return this.month.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }
  get days() {
    return Array.from(
      { length: new Date(this.month.getFullYear(), this.month.getMonth() + 1, 0).getDate() },
      (_, i) => i + 1,
    );
  }
  get blanks() {
    return Array.from({ length: (this.month.getDay() + 6) % 7 }, (_, i) => i);
  }
  get visibleDays() {
    return this.week
      ? this.days.filter(
          (d) =>
            Math.floor((d - 1 + this.blanks.length) / 7) ===
            Math.floor((this.selected - 1 + this.blanks.length) / 7),
        )
      : this.days;
  }
  shift(delta: number) {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + delta, 1);
    this.selected = 1;
  }
}
