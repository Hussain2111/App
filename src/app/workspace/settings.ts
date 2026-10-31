import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DemoStore } from '../demo-store';
@Component({
  selector: 'app-settings',
  imports: [RouterLink, FormsModule],
  templateUrl: './settings.html',
})
export class Settings {
  store = inject(DemoStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  get view(): string {
    return this.route.snapshot.data['view'] || 'general';
  }
  name = this.store.displayName();
  voice = this.store.voice();
  phrase = '';
  confirm: 'disconnect' | 'delete' | null = null;
  deleteText = '';
  memories = false;
  addPhrase() {
    const value = this.phrase.trim();
    if (value && !this.store.bannedPhrases().some((p) => p.toLowerCase() === value.toLowerCase()))
      this.store.bannedPhrases.update((p) => [...p, value]);
    this.phrase = '';
  }
  removePhrase(value: string) {
    this.store.bannedPhrases.update((p) => p.filter((x) => x !== value));
  }
  save() {
    this.store.displayName.set(this.name);
    this.store.voice.set(this.voice);
    this.store.notice.set('Preferences saved for this demo session.');
  }
  accept() {
    if (this.confirm === 'delete') {
      if (this.deleteText !== 'DELETE') return;
      this.store.reset();
      this.router.navigateByUrl('/sign-up');
    } else {
      this.store.connected.set(false);
      this.store.notice.set(
        'Demo Instagram connection removed. Drafts, chats and preferences are retained.',
      );
    }
    this.confirm = null;
  }
}
