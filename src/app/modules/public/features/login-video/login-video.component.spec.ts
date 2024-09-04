import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVideoComponent } from './login-video.component';

describe('LoginVideoComponent', () => {
  let component: LoginVideoComponent;
  let fixture: ComponentFixture<LoginVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
