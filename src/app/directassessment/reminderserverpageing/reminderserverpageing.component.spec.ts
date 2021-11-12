import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderserverpageingComponent } from './reminderserverpageing.component';

describe('ReminderserverpageingComponent', () => {
  let component: ReminderserverpageingComponent;
  let fixture: ComponentFixture<ReminderserverpageingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReminderserverpageingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderserverpageingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
