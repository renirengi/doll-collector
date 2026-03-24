import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { SignInPageComponent } from './signin-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { AuthApiService } from '../../../../../api/services/auth.api';
import { TokenService } from '../../../../core/services/token.services';
import { of, throwError } from 'rxjs';

describe('SignInPageComponent', () => {
  let component: SignInPageComponent;
  let fixture: ComponentFixture<SignInPageComponent>;
  let authApiSpy: jasmine.SpyObj<AuthApiService>;
  let tokenServiceSpy: jasmine.SpyObj<TokenService>;
  let router: Router;

  beforeEach(async () => {
    authApiSpy = jasmine.createSpyObj('AuthApiService', ['signIn']);
    tokenServiceSpy = jasmine.createSpyObj('TokenService', ['setTokens']);

    await TestBed.configureTestingModule({
      imports: [SignInPageComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthApiService, useValue: authApiSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.signInForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const email = component.signInForm.controls['email'];
    email.setValue('invalid-email');
    expect(email.hasError('email')).toBeTruthy();
  });

  it('should call authApi.signIn and navigate on success', fakeAsync(() => {
    const mockResponse = { access_token: 'fake-jwt-token' };
    authApiSpy.signIn.and.returnValue(of(mockResponse));
    spyOn(router, 'navigate');

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    component.submit();
    tick();

    expect(authApiSpy.signIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(tokenServiceSpy.setTokens).toHaveBeenCalledWith('fake-jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/user/catalog']);
    expect(component.isLoading).toBeFalse();
  }));

  it('should show alert on login failure', fakeAsync(() => {
    authApiSpy.signIn.and.returnValue(
      throwError(() => new Error('401 Unauthorized')),
    );
    spyOn(window, 'alert');

    component.signInForm.setValue({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });

    component.submit();
    tick();

    expect(window.alert).toHaveBeenCalledWith(
      'Login failed. Please check your email and password.',
    );
    expect(component.isLoading).toBeFalse();
  }));
});
