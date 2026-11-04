import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { SignUp } from './sign-up';

describe('SignUp form', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SignUp], providers: [
      provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
    ] }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });
  it('shows duplicate-email errors in the form and clears them on retry', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();
    fixture.componentInstance.signUpForm.setValue({ name: 'Test User', email: 'user@example.test', password: 'test-password' });
    fixture.componentInstance.onSubmit();
    http.expectOne('/signup').flush('Email already exists', { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('this email already exists');
    expect(navigate).not.toHaveBeenCalled();
    fixture.componentInstance.onSubmit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toBe('');
    http.expectOne('/signup').flush({ id: 7, name: 'Test User', email: 'user@example.test' });
    expect(navigate).toHaveBeenCalledWith(['/sign-in']);
  });
  it('shows a retry message when the server fails', () => {
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();
    fixture.componentInstance.signUpForm.setValue({ name: 'Test User', email: 'user@example.test', password: 'test-password' });
    fixture.componentInstance.onSubmit();
    http.expectOne('/signup').flush('Internal error', { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Please try again');
  });
  it('does not submit missing required fields', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();
    fixture.componentInstance.onSubmit();
    http.expectNone('/signup');
  });
  it('binds inputs and redirects to sign-in after account creation', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();
    const credentials = { name: 'Test User', email: 'user@example.test', password: 'test-password' };
    for (const [name, value] of Object.entries(credentials)) {
      const input = fixture.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne('/signup');
    expect(request.request.body).toEqual(credentials);
    expect(navigate).not.toHaveBeenCalled();
    request.flush({ id: 7, name: credentials.name, email: credentials.email }, { status: 201, statusText: 'Created' });
    expect(navigate).toHaveBeenCalledWith(['/sign-in']);
  });
});
