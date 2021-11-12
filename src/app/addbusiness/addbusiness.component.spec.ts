import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddbusinessComponent } from './addbusiness.component';

describe('AddbusinessComponent', () => {
  let component: AddbusinessComponent;
  let fixture: ComponentFixture<AddbusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddbusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
