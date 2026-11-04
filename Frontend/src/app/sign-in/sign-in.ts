import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../features/header/header';
import { Footer } from '../features/footer/footer';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Authentication } from '../authentication';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [Header, Footer, RouterLink, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})


export class SignIn {
  authentication: Authentication;
  router: Router;

  constructor(authentication: Authentication, router: Router) {
    this.authentication = authentication;
    this.router = router;
  }

 signInForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
  });

  onSubmit() {
    const formData = this.signInForm.getRawValue();
    // check for an invalid form before submitting
    if (this.signInForm.invalid) {
      console.error('Form is invalid:', this.signInForm.errors);
      return;
    }
    this.authentication.login(formData.email, formData.password).subscribe({
      next: () => {
        this.router.navigate(['/step1']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
