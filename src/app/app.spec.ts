import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { Landing } from './features/landing/landing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

// Test

describe('App Routing', () => {
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
    harness = await RouterTestingHarness.create('/');
  });

  it('should navigate to the home page', async () => {
    const activeLink = await harness.navigateByUrl('/', Landing);
    expect(activeLink).toBeInstanceOf(Landing);
  });
});
