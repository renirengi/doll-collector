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

  describe('Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.signUpForm.valid).toBeFalsy();
    });

    it('should validate username length', () => {
      const control = component.signUpForm.get('username');
      control?.setValue('user');
      expect(control?.valid).toBeFalsy();
      control?.setValue('username123');
      expect(control?.valid).toBeTruthy();
    });

    it('should validate email format', () => {
      const control = component.signUpForm.get('email');
      control?.setValue('invalid-email');
      expect(control?.valid).toBeFalsy();
      control?.setValue('test@test.com');
      expect(control?.valid).toBeTruthy();
    });

    it('should validate password mismatch', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentPassword',
      });

      expect(component.signUpForm.hasError('passwordMismatch')).toBeTrue();

      component.signUpForm.patchValue({ confirmPassword: 'password123' });
      expect(component.signUpForm.hasError('passwordMismatch')).toBeFalse();
    });
  });

  describe('Form Submission', () => {
    const validData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    it('should call signUp and signIn on success and navigate', fakeAsync(() => {
      authApiSpy.signUp.and.returnValue(of(undefined));
      authApiSpy.signIn.and.returnValue(
        of({ access_token: 'fake-token', userId: '1' }),
      );
      spyOn(router, 'navigate');

      component.signUpForm.setValue(validData);
      component.submit();

      expect(component.isLoading).toBeTrue();
      tick();

      expect(authApiSpy.signUp).toHaveBeenCalledWith(validData);
      expect(authApiSpy.signIn).toHaveBeenCalledWith({
        email: validData.email,
        password: validData.password,
      });

      expect(tokenServiceSpy.setTokens).toHaveBeenCalledWith('fake-token');

      expect(router.navigate).toHaveBeenCalledWith(['/dolls']);
      expect(component.isLoading).toBeFalse();
    }));

    it('should show alert and reset loading on error', fakeAsync(() => {
      authApiSpy.signUp.and.returnValue(
        throwError(() => new Error('API Error')),
      );
      spyOn(window, 'alert');

      component.signUpForm.setValue(validData);
      component.submit();

      tick();

      expect(window.alert).toHaveBeenCalled();
      expect(component.isLoading).toBeFalse();
      expect(tokenServiceSpy.setTokens).not.toHaveBeenCalled();
    }));

    it('should mark all fields as touched if form is invalid', () => {
      spyOn(component.signUpForm, 'markAllAsTouched');
      component.submit();
      expect(component.signUpForm.markAllAsTouched).toHaveBeenCalled();
      expect(authApiSpy.signUp).not.toHaveBeenCalled();
    });
  });
});
