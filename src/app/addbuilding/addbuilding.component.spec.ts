import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddbuildingComponent } from './addbuilding.component';

describe('AddbuildingComponent', () => {
  let component: AddbuildingComponent;
  let fixture: ComponentFixture<AddbuildingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddbuildingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddbuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
