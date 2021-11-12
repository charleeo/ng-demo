import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkcorporateuploadComponent } from './bulkcorporateupload.component';

describe('BulkcorporateuploadComponent', () => {
  let component: BulkcorporateuploadComponent;
  let fixture: ComponentFixture<BulkcorporateuploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BulkcorporateuploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkcorporateuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
