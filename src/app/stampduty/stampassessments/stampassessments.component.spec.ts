import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampassessmentsComponent } from './stampassessments.component';

describe('StampassessmentsComponent', () => {
  let component: StampassessmentsComponent;
  let fixture: ComponentFixture<StampassessmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StampassessmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampassessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
