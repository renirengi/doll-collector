import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignUpPageComponent } from './signup-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthApiService } from '../../../../../api/services/auth.api';
import { AuthService } from '../../../../core/services/auth.service';
import { TokenService } from '../../../../core/services/token.services';
import { MessageService } from '../../../../core/services/message-service.service';
import { of, throwError } from 'rxjs';

class RouterMock {
  navigate = jasmine.createSpy('navigate');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('');
  url = '/auth/signup';
  events = of([]);
  routerState = { root: {} };
}

class ActivatedRouteMock {
  params = of({});
  queryParams = of({});
  snapshot = { params: {}, queryParams: {} };
}

class AuthApiServiceMock {
  signUp = jasmine.createSpy('signUp');
  signIn = jasmine.createSpy('signIn');
}

class AuthServiceMock {
  login = jasmine.createSpy('login');
}

class MessageServiceMock {
  showError = jasmine.createSpy('showError');
  showSuccess = jasmine.createSpy('showSuccess');
}

class TokenServiceMock {
  setTokens = jasmine.createSpy('setTokens');
}

describe('SignUpPageComponent', () => {
  let component: SignUpPageComponent;
  let fixture: ComponentFixture<SignUpPageComponent>;
  let authApiMock: AuthApiServiceMock;
  let authServiceMock: AuthServiceMock;
  let messageServiceMock: MessageServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpPageComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthApiService, useClass: AuthApiServiceMock },
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: MessageService, useClass: MessageServiceMock },
        { provide: TokenService, useClass: TokenServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpPageComponent);
    component = fixture.componentInstance;

    authApiMock = TestBed.inject(
      AuthApiService,
    ) as unknown as AuthApiServiceMock;
    authServiceMock = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    messageServiceMock = TestBed.inject(
      MessageService,
    ) as unknown as MessageServiceMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Validation', () => {
    it('should validate email format', () => {
      const email = component.signUpForm.controls.email;
      email.setValue('invalid-email');
      expect(email.valid).toBeFalse();

      email.setValue('test@example.com');
      expect(email.valid).toBeTrue();
    });

    it('should validate password mismatch', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'different123',
      });
      expect(component.signUpForm.hasError('passwordMismatch')).toBeTrue();
    });
  });

  describe('Form Submission', () => {
    it('should call messageService.showError on registration failure', async () => {
      component.signUpForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      authApiMock.signUp.and.returnValue(
        throwError(() => new Error('Conflict')),
      );

      await component.submit();

      expect(messageServiceMock.showError).toHaveBeenCalledWith(
        jasmine.stringMatching(/already be in use/i),
      );
    });

    it('should trigger authService.login on success', async () => {
      component.signUpForm.setValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      authApiMock.signUp.and.returnValue(of({}));
      authServiceMock.login.and.resolveTo();

      await component.submit();

      expect(authServiceMock.login).toHaveBeenCalled();
      expect(messageServiceMock.showSuccess).toHaveBeenCalled();
    });
  });
});
