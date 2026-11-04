import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Featurescards } from './featurescards';

describe('Featurescards', () => {
  let component: Featurescards;
  let fixture: ComponentFixture<Featurescards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Featurescards],
    }).compileComponents();

    fixture = TestBed.createComponent(Featurescards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
