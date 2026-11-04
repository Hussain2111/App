import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DemoStore } from '../../demo-store';
@Component({
  selector: 'app-step3',
  imports: [RouterLink],
  templateUrl: './step3.html',
  styleUrl: './step3.css',
})
export class Step3 {
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
