import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DemoStore } from '../demo-store';
@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<header class="app-header">
      <a class="brand" routerLink="/dashboard"><span class="brand-mark">t</span>trellis</a>
      <nav aria-label="Main navigation">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a
        ><a routerLink="/hot-topics" routerLinkActive="active">Hot Topics</a
        ><a routerLink="/competitors" routerLinkActive="active">Competitors</a>
      </nav>
      <div class="actions">
        <a class="button" routerLink="/chat" routerLinkActive="active">? Chat</a>
        <details class="account-menu">
          <summary aria-label="Account menu">{{ store.displayName().slice(0, 1) || 'U' }}</summary>
          <div>
            <a routerLink="/settings" (click)="close($event)">Settings</a
            ><a routerLink="/states" (click)="close($event)">Screen states</a
            ><a routerLink="/sign-in" (click)="close($event)">Sign out</a>
          </div>
        </details>
      </div>
    </header>
    <div class="demo-strip">
      FRONTEND PREVIEW ? Sample ideas only ? No live Instagram or AI connection ? Changes last until
      reload
    </div>
    <main class="page">
      @if (store.notice()) {
        <div class="notice" role="status">
          {{ store.notice()
          }}<button aria-label="Dismiss notification" (click)="store.notice.set('')">?</button>
        </div>
      }
      <router-outlet />
    </main>`,
})
export class Shell {
  store = inject(DemoStore);
  close(e: Event) {
    (e.target as HTMLElement).closest('details')?.removeAttribute('open');
  }
}
