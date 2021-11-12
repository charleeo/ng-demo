import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddcorporateComponent } from './addcorporate.component';

describe('AddcorporateComponent', () => {
  let component: AddcorporateComponent;
  let fixture: ComponentFixture<AddcorporateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddcorporateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddcorporateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
