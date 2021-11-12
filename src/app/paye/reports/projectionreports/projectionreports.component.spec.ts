import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectionreportsComponent } from './projectionreports.component';

describe('ProjectionreportsComponent', () => {
  let component: ProjectionreportsComponent;
  let fixture: ComponentFixture<ProjectionreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectionreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectionreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
