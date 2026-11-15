import { Component, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface DraftMedia {
  file: File;
  url: string;
}
interface PlannerDraft {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  format: string;
  date: string;
  media: DraftMedia[];
}

@Component({
  selector: 'app-planner',
  imports: [RouterLink, FormsModule],
  templateUrl: './planner.html',
  styles: `.planner-layout { display: grid; gap: 24px; }
.planner-layout > .panel { margin: 0; }
.calendar-toolbar, .dialog-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.calendar-toolbar h2, .dialog-heading h2 { margin: 0; }
.month-arrow { width: 42px; height: 42px; padding: 10px; }
.month-arrow svg { width: 18px; height: 18px; }
.calendar button.today { background: #eef3e6; }
.calendar button.today .day-number { font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
.today-label, .draft-label { font-size: 11px; color: var(--green); margin-top: 6px; }
.selected-date { margin: 16px 0 0; color: var(--muted); font-size: 14px; }
.draft-dialog { position: fixed; inset: 0; margin: auto; width: min(520px, calc(100vw - 32px)); max-height: 80dvh; overflow-y: auto; padding: 20px; border: 1px solid var(--line); border-radius: 12px; color: #293b32; background: white; box-sizing: border-box; font-size: 14px; box-shadow: 0 12px 40px rgb(20 35 28 / 16%); }
.draft-dialog h2 { font-size: 20px; }
.draft-dialog label { margin: 12px 0 5px; font-size: 13px; }
.draft-dialog input, .draft-dialog select, .draft-dialog textarea { padding: 8px 10px; font-size: 14px; margin-bottom: 0; }
.draft-dialog textarea { min-height: 80px; height: 80px; }
.draft-dialog p.muted { font-size: 12px; line-height: 1.4; margin: 6px 0 12px; }
.draft-dialog button { padding: 8px 12px; font-size: 13px; }
.draft-dialog::backdrop { background: rgb(20 35 28 / 28%); }
.dialog-heading { align-items: flex-start; margin-bottom: 12px; }
.dialog-heading p { margin: 8px 0 0; color: var(--muted); }
.dialog-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; margin-top: 16px; }
.upload-list { list-style: none; margin: 12px 0; padding: 0; }
.upload-list li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.upload-list li span { overflow-wrap: anywhere; min-width: 0; }
.upload-list button { padding: 6px 10px; font-size: 12px; }
.media-preview { background: #f3f5ee; border-radius: 8px; overflow: hidden; text-align: center; }
.media-preview img, .media-preview video { display: block; width: 100%; max-height: 360px; object-fit: contain; }
.preview-navigation { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 12px; }
.draft-copy p { white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 480px) { .draft-dialog { padding: 18px; } .calendar button { padding: 8px 4px; } }
`,
})
export class Planner implements OnDestroy {
  private today = new Date();
  draft: PlannerDraft = this.emptyDraft(this.localDate(this.today));
  savedDrafts = signal<PlannerDraft[]>([]);
  step = signal<'edit' | 'preview'>('edit');
  uploadError = signal('');
  previewIndex = signal(0);
  message = signal('');
  private mediaURLs = new Set<string>();
  @ViewChild('draftDialog') draftDialog!: ElementRef<HTMLDialogElement>;

  selected = this.today.getDate();
  week = false;
  month = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
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
    const firstDay = this.week ? this.visibleDays[0] : 1;
    const offset = (new Date(this.month.getFullYear(), this.month.getMonth(), firstDay).getDay() + 6) % 7;
    return Array.from({ length: offset }, (_, i) => i);
  }
  get visibleDays() {
    return this.week
      ? this.days.filter(
          (d) =>
            Math.floor((d - 1 + ((this.month.getDay() + 6) % 7)) / 7) ===
            Math.floor((this.selected - 1 + ((this.month.getDay() + 6) % 7)) / 7),
        )
      : this.days;
  }
  private localDate(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  get selectedDate() {
    return this.localDate(new Date(this.month.getFullYear(), this.month.getMonth(), this.selected));
  }
  get selectedDateLabel() {
    return new Date(this.month.getFullYear(), this.month.getMonth(), this.selected)
      .toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }
  isToday(day: number) {
    const today = new Date();
    return day === today.getDate() && this.month.getMonth() === today.getMonth()
      && this.month.getFullYear() === today.getFullYear();
  }
  goToToday() {
    const today = new Date();
    this.month = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selected = today.getDate();
  }
  shift(delta: number) {
    this.month = new Date(this.month.getFullYear(), this.month.getMonth() + delta, 1);
    this.selected = 1;
  }

  private emptyDraft(date: string): PlannerDraft {
    return { hook: '', caption: '', cta: '', hashtags: '', format: 'Image', date, media: [] };
  }
  openDate(day: number) {
    this.selected = day;
    const saved = this.savedDrafts().find((item) => item.date === this.selectedDate);
    this.draft = saved ? { ...saved, media: [...saved.media] } : this.emptyDraft(this.selectedDate);
    this.step.set(saved ? 'preview' : 'edit');
    this.uploadError.set('');
    this.previewIndex.set(0);
    this.draftDialog.nativeElement.showModal();
  }
  hasDraft(day: number) {
    const date = this.localDate(new Date(this.month.getFullYear(), this.month.getMonth(), day));
    return this.savedDrafts().some((draft) => draft.date === date);
  }
  addFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    this.uploadError.set('');
    for (const file of Array.from(input.files ?? [])) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        this.uploadError.set('Only image and video files can be added.');
        continue;
      }
      const url = URL.createObjectURL(file);
      this.mediaURLs.add(url);
      this.draft.media.push({ file, url });
    }
    this.suggestFormat();
    input.value = '';
  }
  removeFile(index: number) {
    this.draft.media.splice(index, 1);
    this.suggestFormat();
    this.releaseUnusedMedia();
  }
  private suggestFormat() {
    this.draft.format = this.draft.media.length > 1 ? 'Carousel'
      : this.draft.media[0]?.file.type.startsWith('video/') ? 'Reel' : 'Image';
  }
  previewDraft() {
    const media = this.draft.media;
    if (media.length && (
      (this.draft.format === 'Reel' && (media.length !== 1 || !media[0].file.type.startsWith('video/'))) ||
      (this.draft.format === 'Image' && (media.length !== 1 || !media[0].file.type.startsWith('image/'))) ||
      (this.draft.format === 'Carousel' && media.length < 2)
    )) {
      this.uploadError.set('Choose Image for one image, Reel for one video, or Carousel for multiple images/videos.');
      return;
    }
    this.uploadError.set('');
    this.previewIndex.set(0);
    this.step.set('preview');
  }
  saveDraft() {
    const saved = { ...this.draft, media: [...this.draft.media] };
    this.savedDrafts.update((drafts) => [...drafts.filter((item) => item.date !== saved.date), saved]
      .sort((a, b) => a.date.localeCompare(b.date)));
    this.message.set('Draft saved for this visit. Refreshing or leaving the planner will clear it.');
    this.closeDraft();
  }
  deleteDraft() {
    this.savedDrafts.update((drafts) => drafts.filter((item) => item.date !== this.draft.date));
    this.message.set('Draft deleted.');
    this.closeDraft();
  }
  closeDraft() {
    this.draftDialog.nativeElement.querySelectorAll('video').forEach((video) => video.pause());
    this.draftDialog.nativeElement.close();
    this.draft = this.emptyDraft(this.selectedDate);
    this.releaseUnusedMedia();
  }
  private releaseUnusedMedia() {
    const used = new Set([...this.savedDrafts().flatMap((draft) => draft.media), ...this.draft.media]
      .map((media) => media.url));
    for (const url of this.mediaURLs) {
      if (!used.has(url)) {
        URL.revokeObjectURL(url);
        this.mediaURLs.delete(url);
      }
    }
  }
  ngOnDestroy() {
    for (const url of this.mediaURLs) URL.revokeObjectURL(url);
  }

}
