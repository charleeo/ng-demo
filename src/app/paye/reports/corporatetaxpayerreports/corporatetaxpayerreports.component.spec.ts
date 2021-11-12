/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CorporatetaxpayerreportsComponent } from './corporatetaxpayerreports.component';

describe('CorporatetaxpayerreportsComponent', () => {
  let component: CorporatetaxpayerreportsComponent;
  let fixture: ComponentFixture<CorporatetaxpayerreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorporatetaxpayerreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporatetaxpayerreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
