import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassessmentappealsComponent } from './reassessmentappeals.component';

describe('ReassessmentappealsComponent', () => {
  let component: ReassessmentappealsComponent;
  let fixture: ComponentFixture<ReassessmentappealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassessmentappealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassessmentappealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
