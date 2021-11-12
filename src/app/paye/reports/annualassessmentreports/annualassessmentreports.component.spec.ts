import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualassessmentreportsComponent } from './annualassessmentreports.component';

describe('AnnualassessmentreportsComponent', () => {
  let component: AnnualassessmentreportsComponent;
  let fixture: ComponentFixture<AnnualassessmentreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualassessmentreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualassessmentreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
