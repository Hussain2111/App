import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../features/header/header';
import { Footer } from '../features/footer/footer';
import { DemoStore } from '../demo-store';
@Component({
  selector: 'app-sign-up',
  imports: [Header, Footer, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
  private router = inject(Router);
  store = inject(DemoStore);
  submit(event: Event) {
    event.preventDefault();
    this.router.navigateByUrl('/step1');
  }
}
