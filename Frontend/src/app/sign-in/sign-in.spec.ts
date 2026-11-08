import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { SignIn } from './sign-in';

describe('SignIn form', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignIn], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });
  it('does not send an invalid form', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectNone('/signin');
  });
  it('submits input values and navigates only after success', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    for (const [name, value] of [['email', 'user@example.test'], ['password', 'test-password']]) {
      const input = fixture.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne('/signin');
    expect(request.request.body).toEqual({ email: 'user@example.test', password: 'test-password' });
    expect(navigate).not.toHaveBeenCalled();
    request.flush({ id: 7, name: 'Test User', email: 'user@example.test' });
    expect(navigate).not.toHaveBeenCalled();
    http.expectOne('/auth/instagram/connection').flush({ insta_ID: '123', username: 'test-account' });
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
  it('does not navigate after rejected credentials', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    fixture.componentInstance.signInForm.setValue({ email: 'user@example.test', password: 'wrong-password' });
    fixture.componentInstance.onSubmit();
    http.expectOne('/signin').flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    expect(navigate).not.toHaveBeenCalled();
    http.expectNone('/auth/instagram/connection');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Check your email and password');
  });
  it('routes to step 1 only when the connection is missing', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    fixture.componentInstance.signInForm.setValue({ email: 'user@example.test', password: 'test-password' });
    fixture.componentInstance.onSubmit();
    http.expectOne('/signin').flush({ id: 7, name: 'Test User', email: 'user@example.test' });
    http.expectOne('/auth/instagram/connection').flush('No connection', { status: 404, statusText: 'Not Found' });
    expect(navigate).toHaveBeenCalledWith(['/step1']);
  });
  it('shows connection lookup failures without navigating', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    fixture.componentInstance.signInForm.setValue({ email: 'user@example.test', password: 'test-password' });
    fixture.componentInstance.onSubmit();
    http.expectOne('/signin').flush({ id: 7, name: 'Test User', email: 'user@example.test' });
    http.expectOne('/auth/instagram/connection').flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Unable to complete sign-in');
  });
});
