import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualassessmentsComponent } from './individualassessments.component';

describe('IndividualassessmentsComponent', () => {
  let component: IndividualassessmentsComponent;
  let fixture: ComponentFixture<IndividualassessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualassessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
