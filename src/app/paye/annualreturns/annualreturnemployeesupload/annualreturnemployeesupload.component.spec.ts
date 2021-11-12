import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualreturnemployeesuploadComponent } from './annualreturnemployeesupload.component';

describe('AnnualreturnemployeesuploadComponent', () => {
  let component: AnnualreturnemployeesuploadComponent;
  let fixture: ComponentFixture<AnnualreturnemployeesuploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnualreturnemployeesuploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnualreturnemployeesuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
