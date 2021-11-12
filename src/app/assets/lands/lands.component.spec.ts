import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandsComponent } from './lands.component';

describe('LandsComponent', () => {
  let component: LandsComponent;
  let fixture: ComponentFixture<LandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
