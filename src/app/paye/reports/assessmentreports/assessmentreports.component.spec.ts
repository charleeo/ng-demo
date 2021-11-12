import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentreportsComponent } from './assessmentreports.component';

describe('AssessmentreportsComponent', () => {
  let component: AssessmentreportsComponent;
  let fixture: ComponentFixture<AssessmentreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
