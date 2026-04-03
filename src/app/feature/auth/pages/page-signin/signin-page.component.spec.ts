import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { SignInPageComponent } from './signin-page.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('SignInPageComponent', () => {
  let component: SignInPageComponent;
  let fixture: ComponentFixture<SignInPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [SignInPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.signInForm.valid).toBeFalse();
  });

  it('should validate email format', () => {
    const email = component.signInForm.controls['email'];
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTrue();

    email.setValue('test@example.com');
    expect(email.errors).toBeNull();
  });

  it('should call authService.login and handle loading state', async () => {
    authServiceSpy.login.and.returnValue(Promise.resolve());

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    const submitPromise = component.submit();

    expect(component.isLoading()).toBeTrue();

    await submitPromise;

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(component.isLoading()).toBeFalse();
  });

  it('should show alert on login failure', async () => {
    spyOn(window, 'alert');
    authServiceSpy.login.and.returnValue(Promise.reject('Error'));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    await component.submit();

    expect(window.alert).toHaveBeenCalledWith(
      'Login failed. Please check your credentials.',
    );
    expect(component.isLoading()).toBeFalse();
  });
});
