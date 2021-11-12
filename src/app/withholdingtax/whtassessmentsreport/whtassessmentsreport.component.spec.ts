import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhtassessmentsreportComponent } from './whtassessmentsreport.component';

describe('WhtassessmentsreportComponent', () => {
  let component: WhtassessmentsreportComponent;
  let fixture: ComponentFixture<WhtassessmentsreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhtassessmentsreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhtassessmentsreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
