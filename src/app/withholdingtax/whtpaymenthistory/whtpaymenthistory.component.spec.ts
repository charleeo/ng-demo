import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhtpaymenthistoryComponent } from './whtpaymenthistory.component';

describe('WhtpaymenthistoryComponent', () => {
  let component: WhtpaymenthistoryComponent;
  let fixture: ComponentFixture<WhtpaymenthistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhtpaymenthistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhtpaymenthistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
