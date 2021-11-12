import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampobjectionsComponent } from './stampobjections.component';

describe('StampobjectionsComponent', () => {
  let component: StampobjectionsComponent;
  let fixture: ComponentFixture<StampobjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StampobjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampobjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
