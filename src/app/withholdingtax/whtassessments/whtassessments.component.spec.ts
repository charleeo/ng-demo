import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhtassessmentsComponent } from './whtassessments.component';

describe('WhtassessmentsComponent', () => {
  let component: WhtassessmentsComponent;
  let fixture: ComponentFixture<WhtassessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhtassessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhtassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
