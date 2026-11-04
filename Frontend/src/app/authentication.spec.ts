import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { Authentication } from './authentication';

describe('Authentication', () => {
  let service: Authentication;
  let http: HttpTestingController;
  const user = { id: 7, name: 'Test User', email: 'user@example.test' };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    service = TestBed.inject(Authentication);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); vi.restoreAllMocks(); });
  it('restores the user through GET /me', () => {
    service.fetchUser().subscribe(value => expect(value).toEqual(user));
    const request = http.expectOne('/me');
    expect(request.request.method).toBe('GET');
    request.flush(user);
    expect(service.user()).toEqual(user);
  });
  it('uses cached state unless a reload is requested', () => {
    service.user.set(user);
    service.fetchUser().subscribe(value => expect(value).toEqual(user));
    http.expectNone('/me');
    service.fetchUser(true).subscribe();
    http.expectOne('/me').flush({ ...user, name: 'Updated' });
    expect(service.user()?.name).toBe('Updated');
  });
  it('sets user state only after successful sign-in', () => {
    service.login(user.email, 'test-password').subscribe();
    const request = http.expectOne('/signin');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: user.email, password: 'test-password' });
    expect(service.user()).toBeNull();
    request.flush(user);
    expect(service.user()).toEqual(user);
    http.expectNone('/me');
  });
  it('propagates invalid credentials without creating a session state', () => {
    const onError = vi.fn();
    service.login(user.email, 'wrong').subscribe({ error: onError });
    http.expectOne('/signin').flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    expect(onError).toHaveBeenCalledOnce();
    expect(service.user()).toBeNull();
    http.expectNone('/logout');
  });
  it('registers with name and leaves the user signed out', () => {
    const credentials = { name: user.name, email: user.email, password: 'test-password' };
    service.register(credentials).subscribe();
    const request = http.expectOne('/signup');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(user, { status: 201, statusText: 'Created' });
    expect(service.user()).toBeNull();
  });
  it('propagates duplicate-email errors', () => {
    const onError = vi.fn();
    service.register({ name: user.name, email: user.email, password: 'test-password' }).subscribe({ error: onError });
    http.expectOne('/signup').flush('Email already exists', { status: 409, statusText: 'Conflict' });
    expect(onError).toHaveBeenCalledOnce();
    expect(service.user()).toBeNull();
  });
  it('clears state and redirects after logout succeeds', () => {
    service.user.set(user);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    service.logout();
    expect(service.user()).toEqual(user);
    expect(navigate).not.toHaveBeenCalled();
    const request = http.expectOne('/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null);
    expect(service.user()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/sign-in']);
  });
});
