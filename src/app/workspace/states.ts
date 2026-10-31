import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoStore } from '../demo-store';
@Component({
  selector: 'app-states',
  imports: [RouterLink],
  template: ` <p class="eyebrow">Prototype / Shared states</p>
    <div class="page-title">
      <div>
        <h1>A clear next step, even when things stop.</h1>
        <p>
          Examples of the shared states in the wireframe. These do not simulate real provider
          results.
        </p>
      </div>
    </div>
    <div class="grid equal">
      @for (state of states; track state.title) {
        <section class="panel" style="margin:0">
          <span class="badge">{{ state.status }}</span>
          <h2 style="margin-top:18px">{{ state.title }}</h2>
          <p>{{ state.description }}</p>
          <a class="button" [routerLink]="state.link">{{ state.action }}</a>
        </section>
      }
    </div>
    <section class="panel" style="margin-top:24px">
      <h2>In-app reminder</h2>
      <p>A reminder can be dismissed without removing the planned task.</p>
      <button
        (click)="
          store.notice.set(
            'Reminder preview: review your planned draft. Dismissing this reminder keeps the draft in your planner.'
          )
        "
      >
        Show reminder
      </button>
    </section>`,
})
export class States {
  store = inject(DemoStore);
  states = [
    {
      title: 'No Instagram account',
      status: 'Connection required',
      description: 'Connect a Creator account to begin retrieving authorized data.',
      link: '/step1',
      action: 'Connect Instagram',
    },
    {
      title: 'No observations',
      status: 'Coverage unavailable',
      description: 'There is no verified history. Unknown metrics remain unavailable.',
      link: '/dashboard/analytics',
      action: 'View coverage',
    },
    {
      title: 'Provider or token error',
      status: 'Reconnect required',
      description: 'If authorization expires, reconnect. Saved drafts should stay available.',
      link: '/step1',
      action: 'Reconnect',
    },
    {
      title: 'AI unavailable',
      status: 'Provider not connected',
      description:
        'An answer cannot be generated. Your conversation remains available in this session.',
      link: '/chat',
      action: 'Open Chat',
    },
    {
      title: 'Draft save & recovery',
      status: 'Session-only saving',
      description:
        'Saved and unsaved states are explicit. Reloading this demo clears its state. Conflict recovery will require backend versioning.',
      link: '/dashboard/planner/draft',
      action: 'Open editor',
    },
    {
      title: 'Publication failed or uncertain',
      status: 'No invisible retries',
      description:
        'Keep the approved draft. A real provider must reconcile an unknown result before any retry.',
      link: '/dashboard/planner/review',
      action: 'Review draft',
    },
    {
      title: 'Access denied',
      status: 'Authorization required',
      description:
        'A future backend must enforce authorization. Demo routes are open for wireframe review.',
      link: '/sign-in',
      action: 'Sign in',
    },
    {
      title: 'Account lifecycle',
      status: 'Explicit confirmation',
      description:
        'Disconnecting Instagram and deleting the Trellis workspace are separate decisions.',
      link: '/settings/privacy',
      action: 'Privacy & account',
    },
  ];
}
