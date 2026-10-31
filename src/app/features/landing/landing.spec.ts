import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Landing } from './landing';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a primary heading and a get started action', () => {
    const root = fixture.nativeElement as HTMLElement;
    const heading = root.querySelector('h1');
    expect(heading).not.toBeNull();

    const headingText = heading?.textContent?.trim() ?? '';
    expect(headingText).not.toBe('');

    const actions = root.querySelectorAll<HTMLElement>('a, button');

    const getStartedAction = Array.from(actions).find((action) =>
      action.textContent?.trim().toLowerCase().includes('get started'),
    );

    expect(getStartedAction).toBeDefined();
  });

  it('should contain a feature overview with the four Trellis capabilities', () => {
    const root = fixture.nativeElement as HTMLElement;

    const featureHeading = Array.from(root.querySelectorAll<HTMLHeadingElement>('h2, h3')).find(
      (heading) => heading.textContent?.toLowerCase().match(/feature|capabilit|service|overview/),
    );

    expect(featureHeading).toBeDefined();

    const featureSection = featureHeading?.closest('section');
    expect(featureSection).not.toBeNull();

    const features = Array.from(featureSection?.querySelectorAll<HTMLElement>('article, li') ?? []);

    expect(features.length).toBe(4);

    const featureText = features.map((feature) => {
      const heading = feature.querySelector('h2, h3, h4');
      const description = feature.querySelector('p');

      expect(heading?.textContent?.trim()).toBeTruthy();
      expect(description?.textContent?.trim()).toBeTruthy();

      return `${heading?.textContent ?? ''} ${description?.textContent ?? ''}`.toLowerCase();
    });

    const requiredCapabilities = [
      /dashboard|analytics/,
      /ai|artificial intelligence|content creation|generation/,
      /planning|planner|schedule/,
      /discovery|inspiration|explore/,
    ];

    requiredCapabilities.forEach((pattern) => {
      expect(featureText.some((text) => pattern.test(text))).toBe(true);
    });
  });
});
