import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratewhtassessmentComponent } from './generatewhtassessment.component';

describe('GeneratewhtassessmentComponent', () => {
  let component: GeneratewhtassessmentComponent;
  let fixture: ComponentFixture<GeneratewhtassessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneratewhtassessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratewhtassessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
