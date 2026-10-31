import { Injectable, signal } from '@angular/core';
export interface Draft {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  format: string;
  date: string;
}
/** Frontend-only state; replace operations with Go API calls later. */
@Injectable({ providedIn: 'root' })
export class DemoStore {
  connected = signal(false);
  savedIdeas = signal<string[]>([]);
  draft = signal<Draft>({
    hook: '',
    caption: '',
    cta: '',
    hashtags: '',
    format: 'Carousel',
    date: '',
  });
  hasDraft = signal(false);
  bannedPhrases = signal<string[]>([]);
  voice = signal('');
  displayName = signal('');
  notice = signal('');
  saveIdea(idea: string) {
    this.savedIdeas.update((items) => (items.includes(idea) ? items : [...items, idea]));
    this.notice.set('Idea saved. Find it in Saved ideas.');
  }
  reset() {
    this.connected.set(false);
    this.savedIdeas.set([]);
    this.hasDraft.set(false);
    this.draft.set({ hook: '', caption: '', cta: '', hashtags: '', format: 'Carousel', date: '' });
    this.bannedPhrases.set([]);
    this.voice.set('');
    this.displayName.set('');
    this.notice.set('Demo workspace cleared.');
  }
}
