import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
        <a class="button" routerLink="/chat" routerLinkActive="active"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></svg> Chat</a>
        <details class="account-menu">
          <summary aria-label="Account menu">U</summary>
          <div>
            <a routerLink="/settings" (click)="close($event)">Settings</a
            ><a routerLink="/states" (click)="close($event)">Screen states</a
            ><a routerLink="/sign-in" (click)="close($event)">Sign-in screen</a>
          </div>
        </details>
      </div>
    </header>
    <main class="page">
      <router-outlet />
    </main>`,
})
export class Shell {
  close(e: Event) {
    (e.target as HTMLElement).closest('details')?.removeAttribute('open');
  }
}
