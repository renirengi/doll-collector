import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthApiService } from '../../../api/services/auth.api';
import { TokenService } from './token.services';
import { UserService } from './user.service';
import { MessageService } from './message-service.service';
import { User, AuthResponse } from '../../shared/models';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let tokenServiceMock: jasmine.SpyObj<TokenService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 'be19f98f-84bc-4fa4-a7c9-a5c8dc3a0b68',
    email: 'test@example.com',
    username: 'johndoe',
  } as User;

  const mockAuthResponse: AuthResponse = {
    access_token: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
    userId: 'be19f98f-84bc-4fa4-a7c9-a5c8dc3a0b68',
  };

  beforeEach(() => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['signIn']);
    tokenServiceMock = jasmine.createSpyObj(
      'TokenService',
      ['setTokens', 'clearToken', 'token', 'userId'],
      {
        isAuthenticated: () => false,
      },
    );
    userServiceMock = jasmine.createSpyObj('UserService', ['getProfileSync']);
    messageServiceMock = jasmine.createSpyObj('MessageService', [
      'showError',
      'showSuccess',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate'], {
      url: '/auth/signin',
    });

    routerMock.navigate.and.returnValue(Promise.resolve(true));
    userServiceMock.getProfileSync.and.returnValue(Promise.resolve(mockUser));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: authApiMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should successfully login, store tokens, hydrate profile, and navigate', async () => {
      authApiMock.signIn.and.returnValue(of(mockAuthResponse));
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await service.login(credentials);

      expect(tokenServiceMock.setTokens).toHaveBeenCalledWith(
        mockAuthResponse.access_token,
        mockAuthResponse.refreshToken,
        mockAuthResponse.userId,
      );

      expect(userServiceMock.getProfileSync).toHaveBeenCalledWith(
        mockAuthResponse.userId,
      );
      expect(service.currentUser()).toEqual(mockUser);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/user/catalog']);
    });

    it('should call logout and rethrow error if API call fails', async () => {
      authApiMock.signIn.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      await expectAsync(
        service.login({ email: 'test@test.com', password: '123' }),
      ).toBeRejected();

      expect(tokenServiceMock.clearToken).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(messageServiceMock.showError).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalledWith(['/user/catalog']);
    });
  });

  describe('logout', () => {
    it('should clear tokens, reset user signal, and redirect to signin', () => {
      service.logout();

      expect(tokenServiceMock.clearToken).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/signin']);
    });
  });

  describe('restoreSession', () => {
    it('should hydrate profile if token and userId are present in TokenService', async () => {
      userServiceMock.getProfileSync.calls.reset();

      tokenServiceMock.token.and.returnValue('existing-token');
      tokenServiceMock.userId.and.returnValue('existing-id');

      await (service as any).restoreSession();

      expect(userServiceMock.getProfileSync).toHaveBeenCalledWith(
        'existing-id',
      );
      expect(service.currentUser()).toEqual(mockUser);
    });
  });
});
