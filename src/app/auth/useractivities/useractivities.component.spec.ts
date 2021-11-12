import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseractivitiesComponent } from './useractivities.component';

describe('UseractivitiesComponent', () => {
  let component: UseractivitiesComponent;
  let fixture: ComponentFixture<UseractivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseractivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseractivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
