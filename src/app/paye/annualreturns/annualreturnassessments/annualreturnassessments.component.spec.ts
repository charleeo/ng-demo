import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualreturnassessmentsComponent } from './annualreturnassessments.component';

describe('AnnualreturnassessmentsComponent', () => {
  let component: AnnualreturnassessmentsComponent;
  let fixture: ComponentFixture<AnnualreturnassessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualreturnassessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualreturnassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
