import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllcasesComponent } from './allcases.component';

describe('AllcasesComponent', () => {
  let component: AllcasesComponent;
  let fixture: ComponentFixture<AllcasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllcasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllcasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
