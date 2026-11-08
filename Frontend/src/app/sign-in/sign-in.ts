import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../features/header/header';
import { Footer } from '../features/footer/footer';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Authentication } from '../authentication';
import { Router } from '@angular/router';
import { catchError, switchMap, of, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sign-in',
  imports: [Header, Footer, RouterLink, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})


export class SignIn {
  message = signal('');
  private authService = inject(Authentication);
  private router = inject(Router);

 signInForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
    }),
    password: new FormControl('', {
      nonNullable: true,
    }),
  });

  onSubmit() {
    this.message.set('');
    const formData = this.signInForm.getRawValue();
    // check for an invalid form before submitting
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.message.set('Please complete the required fields and use a password of at least 8 characters.');
      return;
    }
    this.authService.login(formData.email, formData.password).pipe(
      switchMap(() =>
        this.authService.fetchProfile().pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 404) {
              return of(null);
            }
            return throwError(() => error);
          })
        )
      )
    ).subscribe({
      next: profile => {
        this.router.navigate([profile ? '/dashboard' : '/step1']);
      },
      error: (error: HttpErrorResponse) => {
        this.message.set(error.status === 401
          ? 'Sign-in failed or your session expired. Check your email and password and try again.'
          : 'Unable to complete sign-in. Please try again.');
      }
    });
  }
}
