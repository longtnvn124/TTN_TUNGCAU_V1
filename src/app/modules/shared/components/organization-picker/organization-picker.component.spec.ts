import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationPickerComponent } from './organization-picker.component';

describe('OrganizationPickerComponent', () => {
  let component: OrganizationPickerComponent;
  let fixture: ComponentFixture<OrganizationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
