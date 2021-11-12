import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualschedulesComponent } from './individualschedules.component';

describe('IndividualschedulesComponent', () => {
  let component: IndividualschedulesComponent;
  let fixture: ComponentFixture<IndividualschedulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualschedulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualschedulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
