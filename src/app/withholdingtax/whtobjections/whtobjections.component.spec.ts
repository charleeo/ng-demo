import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhtobjectionsComponent } from './whtobjections.component';

describe('WhtobjectionsComponent', () => {
  let component: WhtobjectionsComponent;
  let fixture: ComponentFixture<WhtobjectionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhtobjectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhtobjectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
