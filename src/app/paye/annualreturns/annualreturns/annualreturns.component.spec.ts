import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualreturnsComponent } from './annualreturns.component';

describe('AnnualreturnsComponent', () => {
  let component: AnnualreturnsComponent;
  let fixture: ComponentFixture<AnnualreturnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualreturnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualreturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
