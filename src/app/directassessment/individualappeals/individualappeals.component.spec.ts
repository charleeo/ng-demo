import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualappealsComponent } from './individualappeals.component';

describe('IndividualappealsComponent', () => {
  let component: IndividualappealsComponent;
  let fixture: ComponentFixture<IndividualappealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndividualappealsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualappealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
