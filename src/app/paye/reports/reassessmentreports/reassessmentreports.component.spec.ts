import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassessmentreportsComponent } from './reassessmentreports.component';

describe('ReassessmentreportsComponent', () => {
  let component: ReassessmentreportsComponent;
  let fixture: ComponentFixture<ReassessmentreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassessmentreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassessmentreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
