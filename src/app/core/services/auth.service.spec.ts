import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthApiService } from '../../../api/services/auth.api';
import { TokenService } from './token.services';
import { of, throwError } from 'rxjs';
import { User, AuthResponse } from '../../shared/models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let authApiMock: jasmine.SpyObj<AuthApiService>;
  let tokenServiceMock: jasmine.SpyObj<TokenService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['signIn']);
    tokenServiceMock = jasmine.createSpyObj('TokenService', [
      'setTokens',
      'clearToken',
      'token',
      'isAuthenticated',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    tokenServiceMock.token.and.returnValue(undefined);
    tokenServiceMock.isAuthenticated.and.returnValue(false);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: authApiMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login, set session and navigate to catalog', async () => {
      authApiMock.signIn.and.returnValue(of(mockAuthResponse));

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      await service.login(credentials);

      expect(tokenServiceMock.setTokens).toHaveBeenCalledWith(
        mockAuthResponse.access_token,
        mockAuthResponse.refreshToken,
      );

      const storedUser = JSON.parse(localStorage.getItem('user')!);
      expect(storedUser.email).toBe('test@example.com');
      expect(service.currentUser()).toEqual(mockUser);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/catalog']);
    });

    it('should catch and rethrow API errors', async () => {
      authApiMock.signIn.and.returnValue(
        throwError(() => new Error('Invalid credentials')),
      );

      await expectAsync(
        service.login({ email: 'wrong@test.com', password: '123' }),
      ).toBeRejected();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear token, storage and redirect to login', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      service.currentUser.set(mockUser);

      service.logout();

      expect(tokenServiceMock.clearToken).toHaveBeenCalled();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user exists and token is valid', () => {
      service.currentUser.set(mockUser);
      tokenServiceMock.isAuthenticated.and.returnValue(true);

      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when user is missing', () => {
      service.currentUser.set(null);
      tokenServiceMock.isAuthenticated.and.returnValue(true);

      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
