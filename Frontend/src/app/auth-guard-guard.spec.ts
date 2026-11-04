import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import { Authentication } from './authentication';
import { authGuardGuard } from './auth-guard-guard';

describe('authentication guard', () => {
  let session: Subject<{ id: number; name: string; email: string }>;
  beforeEach(() => {
    session = new Subject();
    TestBed.configureTestingModule({ providers: [provideRouter([]), {
      provide: Authentication, useValue: { fetchUser: vi.fn(() => session) },
    }] });
  });
  it('waits for the session check before allowing navigation', () => {
    const result = vi.fn();
    TestBed.runInInjectionContext(() => authGuardGuard()).subscribe(result);
    expect(result).not.toHaveBeenCalled();
    session.next({ id: 7, name: 'Test User', email: 'user@example.test' });
    expect(result).toHaveBeenCalledWith(true);
    session.complete();
  });
  it('redirects when no valid session exists', async () => {
    const result = firstValueFrom(TestBed.runInInjectionContext(() => authGuardGuard()));
    session.error({ status: 401 });
    expect(TestBed.inject(Router).serializeUrl(await result as UrlTree)).toBe('/sign-in');
  });
});
