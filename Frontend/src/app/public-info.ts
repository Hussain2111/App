import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Header } from './features/header/header';
import { Footer } from './features/footer/footer';
@Component({
  selector: 'app-public-info',
  imports: [Header, Footer, RouterLink],
  template: `<app-header />
    <main class="page" style="min-height:65vh;max-width:800px">
      <p class="eyebrow">Trellis / Frontend preview</p>
      <h1>{{ title }}</h1>
      <section class="panel">
        <p>{{ description }}</p>
        @if (kind === 'recover') {
          <form (submit)="recover($event)">
            <label for="recovery-email">Email address</label
            ><input
              id="recovery-email"
              type="email"
              required
              placeholder="name@example.com"
            /><button class="primary" type="submit">Request recovery</button>
          </form>
          @if (requested) {
            <p role="status" style="margin-top:20px">
              Recovery emails are not connected in this preview. No email was sent.
            </p>
          }
        }
        <a class="text-link" style="display:inline-block;margin-top:24px" routerLink="/"
          >Back to Trellis</a
        >
      </section>
    </main>
    <app-footer />`,
})
export class PublicInfo {
  route = inject(ActivatedRoute);
  requested = false;
  get kind(): string {
    return this.route.snapshot.data['kind'];
  }
  get title() {
    return (
      {
        privacy: 'Privacy',
        terms: 'Terms',
        contact: 'Contact',
        recover: 'Recover access',
        missing: 'Page not found',
      } as Record<string, string>
    )[this.kind];
  }
  get description() {
    return (
      {
        privacy:
          'No backend is connected. Editable inputs are not saved. A production privacy policy will be added before launch.',
        terms:
          'This is a wireframe prototype for exploring Trellis. Production terms will be added before launch.',
        contact:
          'Contact details will be added before launch. There is no support form connected in this preview.',
        recover:
          'Enter your email to preview the account recovery flow. Email delivery will be handled by the future backend.',
        missing: 'This page does not exist. Return to the homepage or use the app navigation.',
      } as Record<string, string>
    )[this.kind];
  }
  recover(event: Event) {
    event.preventDefault();
    this.requested = true;
  }
}
