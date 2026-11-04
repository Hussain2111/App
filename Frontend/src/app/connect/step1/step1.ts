import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DemoStore } from '../../demo-store';
@Component({
  selector: 'app-step1',
  imports: [RouterLink],
  templateUrl: './step1.html',
  styleUrl: './step1.css',
})
export class Step1 {
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
