import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DemoStore } from '../../demo-store';
@Component({
  selector: 'app-step2',
  imports: [RouterLink],
  templateUrl: './step2.html',
  styleUrl: './step2.css',
})
export class Step2 {
  store = inject(DemoStore);
  router = inject(Router);
  status = 'Pending';
  finish() {
    this.store.connected.set(true);
    this.router.navigateByUrl('/dashboard');
  }
  retry() {
    this.status = 'Demo sync complete ? no live data imported';
  }
}
