import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualreturnschedulesComponent } from './annualreturnschedules.component';

describe('AnnualreturnschedulesComponent', () => {
  let component: AnnualreturnschedulesComponent;
  let fixture: ComponentFixture<AnnualreturnschedulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualreturnschedulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualreturnschedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
