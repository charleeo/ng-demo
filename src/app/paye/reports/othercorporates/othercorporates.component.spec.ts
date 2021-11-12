import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OthercorporatesComponent } from './othercorporates.component';

describe('OthercorporatesComponent', () => {
  let component: OthercorporatesComponent;
  let fixture: ComponentFixture<OthercorporatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OthercorporatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OthercorporatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
