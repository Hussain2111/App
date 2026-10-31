import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../demo-store';

@Component({
  selector: 'app-planner',
  imports: [RouterLink, FormsModule],
  templateUrl: './planner.html',
})
export class Planner {
  store = inject(DemoStore);
  route = inject(ActivatedRoute);
  get view(): string {
    return this.route.snapshot.data['view'] || 'calendar';
  }
  draft = { ...this.store.draft() };
  saved = false;
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
  get blocked() {
    const text = [this.draft.hook, this.draft.caption, this.draft.cta, this.draft.hashtags]
      .join(' ')
      .toLowerCase();
    return this.store.bannedPhrases().filter((p) => text.includes(p.toLowerCase()));
  }
  get scheduledDay() {
    const date = this.store.draft().date;
    return date ? Number(date.slice(-2)) : 0;
  }
  isScheduled(day: number) {
    const date = this.store.draft().date;
    return (
      !!date &&
      Number(date.slice(0, 4)) === this.month.getFullYear() &&
      Number(date.slice(5, 7)) === this.month.getMonth() + 1 &&
      this.scheduledDay === day
    );
  }
  shift(delta: number) {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + delta, 1);
    this.selected = 1;
  }
  changed() {
    this.saved = false;
    this.confirmed = false;
  }
  save() {
    if (this.blocked.length) return;
    this.store.draft.set({ ...this.draft });
    this.store.hasDraft.set(true);
    this.saved = true;
    this.store.notice.set('Draft saved in this demo session. Reloading clears it.');
  }
  selectDate() {
    this.draft.date = `${this.month.getFullYear()}-${String(this.month.getMonth() + 1).padStart(2, '0')}-${String(this.selected).padStart(2, '0')}`;
    this.store.draft.update((d) => ({ ...d, date: this.draft.date }));
  }
  publish() {
    this.store.notice.set(
      'Publishing unavailable: no Instagram publishing provider is connected. Your draft is preserved; nothing was published.',
    );
    this.confirmed = false;
  }
}
