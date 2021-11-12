import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassessmentsComponent } from './reassessments.component';

describe('ReassessmentsComponent', () => {
  let component: ReassessmentsComponent;
  let fixture: ComponentFixture<ReassessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
