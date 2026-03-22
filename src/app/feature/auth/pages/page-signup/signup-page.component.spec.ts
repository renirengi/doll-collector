import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SignUpPageComponent } from './signup-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { AuthApiService } from '../../../../../api/services/auth.api';
import { TokenService } from '../../../../core/services/token.services';
import { of, throwError } from 'rxjs';

describe('SignUpPageComponent', () => {
  let component: SignUpPageComponent;
  let fixture: ComponentFixture<SignUpPageComponent>;
  let authApiSpy: jasmine.SpyObj<AuthApiService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let router: Router;

  beforeEach(async () => {
    authApiSpy = jasmine.createSpyObj('AuthApiService', ['signUp', 'signIn']);
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['setTokens']);

    await TestBed.configureTestingModule({
      imports: [SignUpPageComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.signUpForm.valid).toBeFalsy();
  });

  it('should show error when email is invalid', () => {
    const emailControl = component.signUpForm.controls['email'];
    emailControl.setValue('not-an-email');
    emailControl.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('email')).toBeTrue();
  });

  it('should show error when password is too short', () => {
    const passControl = component.signUpForm.controls['password'];
    passControl.setValue('123');
    passControl.markAsTouched();
    fixture.detectChanges();

    expect(component.isFieldInvalid('password')).toBeTrue();
  });

  it('should perform signup, then signin, and navigate on success', fakeAsync(() => {
    const credentials = { email: 'newuser@test.com', password: 'password123' };
    authApiSpy.signUp.and.returnValue(of({ message: 'User created' }));
    authApiSpy.signIn.and.returnValue(of({ access_token: 'new-user-token' }));

    spyOn(router, 'navigate');

    component.signUpForm.setValue(credentials);

    component.onSubmit();

    expect(component.isLoading).toBeTrue();

    tick();
    expect(authApiSpy.signUp).toHaveBeenCalledWith(credentials);
    expect(authApiSpy.signIn).toHaveBeenCalledWith(credentials);
    expect(tokenServiceSpy.setTokens).toHaveBeenCalledWith('new-user-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dolls']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle registration error', fakeAsync(() => {
    authApiSpy.signUp.and.returnValue(
      throwError(() => new Error('Email already exists')),
    );
    spyOn(window, 'alert');

    component.signUpForm.setValue({
      email: 'existing@test.com',
      password: 'password123',
    });

    component.onSubmit();
    tick();

    expect(window.alert).toHaveBeenCalledWith(
      'Registration failed. This email might already be in use.',
    );
    expect(component.isLoading).toBeFalse();
    expect(tokenServiceSpy.setTokens).not.toHaveBeenCalled();
  }));
});
