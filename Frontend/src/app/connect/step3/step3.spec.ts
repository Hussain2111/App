import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step3 } from './step3';

describe('Step3', () => {
  let component: Step3;
  let fixture: ComponentFixture<Step3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step3],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Step3);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
