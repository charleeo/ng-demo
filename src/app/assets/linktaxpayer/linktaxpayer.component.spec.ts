import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinktaxpayerComponent } from './linktaxpayer.component';

describe('LinktaxpayerComponent', () => {
  let component: LinktaxpayerComponent;
  let fixture: ComponentFixture<LinktaxpayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinktaxpayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinktaxpayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
