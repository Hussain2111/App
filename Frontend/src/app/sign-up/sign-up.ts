import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Header } from '../features/header/header';
import { Footer } from '../features/footer/footer';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Authentication } from '../authentication';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [Header, Footer, RouterLink, ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})


export class SignUp {
  message = signal('');
  authentication: Authentication;
  router: Router; // Replace 'any' with the actual type if available

  constructor(authentication: Authentication, router: Router) {
    this.authentication = authentication;
    this.router = router;
  }
  signUpForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
    }),
    email: new FormControl('', {
      nonNullable: true,
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
  });

  onSubmit() {
    this.message.set('');
    const formData = this.signUpForm.getRawValue();
    // check for an invalid form before submitting
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.message.set('Please complete the required fields and use a password of at least 8 characters.');
      return;
    }
    this.authentication.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/sign-in']);
      },
      error: (error: HttpErrorResponse) => {
        this.message.set(error.status === 409
          ? 'An account with this email already exists. Please sign in or use another email.'
          : 'Unable to create your account. Please try again.');
      },
    });
  }

}
