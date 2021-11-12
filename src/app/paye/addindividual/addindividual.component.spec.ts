import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddindividualComponent } from './addindividual.component';

describe('AddindividualComponent', () => {
  let component: AddindividualComponent;
  let fixture: ComponentFixture<AddindividualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddindividualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddindividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
