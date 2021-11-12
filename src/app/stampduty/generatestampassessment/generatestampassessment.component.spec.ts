import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratestampassessmentComponent } from './generatestampassessment.component';

describe('GeneratestampassessmentComponent', () => {
  let component: GeneratestampassessmentComponent;
  let fixture: ComponentFixture<GeneratestampassessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratestampassessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratestampassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
