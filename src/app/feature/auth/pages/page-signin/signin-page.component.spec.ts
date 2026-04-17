import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SignInPageComponent } from './signin-page.component';
import { AuthService } from '../../../../core/services/auth.service';
import { of } from 'rxjs';
import { MessageService } from '../../../../core/services/message-service.service';
import { FormErrorComponent } from '../../../userspace/components/form-error/form-error.component';

class RouterMock {
  navigate = jasmine.createSpy('navigate');
  createUrlTree = jasmine.createSpy('createUrlTree').and.returnValue({});
  serializeUrl = jasmine.createSpy('serializeUrl').and.returnValue('');
  url = '/auth/signin';
  events = of([]);
  routerState = { root: {} };
}

class ActivatedRouteMock {
  params = of({});
  queryParams = of({});
  snapshot = { params: {}, queryParams: {} };
}

class AuthServiceMock {
  login = jasmine.createSpy('login');
}

class MessageServiceMock {
  showError = jasmine.createSpy('showError');
  showSuccess = jasmine.createSpy('showSuccess');
}

describe('SignInPageComponent', () => {
  let component: SignInPageComponent;
  let fixture: ComponentFixture<SignInPageComponent>;
  let authServiceMock: AuthServiceMock;
  let messageServiceMock: MessageServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInPageComponent, ReactiveFormsModule, FormErrorComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: MessageService, useClass: MessageServiceMock },
        { provide: Router, useClass: RouterMock },
        { provide: ActivatedRoute, useClass: ActivatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignInPageComponent);
    component = fixture.componentInstance;

    authServiceMock = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    messageServiceMock = TestBed.inject(
      MessageService,
    ) as unknown as MessageServiceMock;

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
    authServiceMock.login.and.returnValue(Promise.resolve());

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    const submitPromise = component.submit();
    // isLoading — это сигнал, вызываем как функцию
    expect(component.isLoading()).toBeTrue();

    await submitPromise;

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(component.isLoading()).toBeFalse();
  });

  it('should show messageService error on login failure', async () => {
    authServiceMock.login.and.returnValue(Promise.reject('Error'));

    component.signInForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    await component.submit();

    expect(messageServiceMock.showError).toHaveBeenCalledWith(
      'Login failed. Please check your credentials.',
    );
    expect(component.isLoading()).toBeFalse();
  });

  it('should mark all fields as touched if form is invalid on submit', async () => {
    component.signInForm.setValue({ email: '', password: '' });
    await component.submit();

    expect(component.signInForm.get('email')?.touched).toBeTrue();
    expect(component.signInForm.get('password')?.touched).toBeTrue();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });
});
