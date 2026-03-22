import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthApiService } from '../../../api/services/auth.api';
import { of, throwError } from 'rxjs';
import { User, AuthResponse } from '../../shared/models/auth.model';
import { TokenService } from './token.services';

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
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const mockAuthResponse: AuthResponse = {
    token: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
    user: mockUser
  };

  beforeEach(() => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['login']);
    tokenServiceMock = jasmine.createSpyObj('TokenService', ['setTokens', 'clearToken', 'token', 'isAuthenticated']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthApiService, useValue: authApiMock },
        { provide: TokenService, useValue: tokenServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    tokenServiceMock.token.and.returnValue(undefined);

    service = TestBed.inject(AuthService);

    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login, set session and navigate', async () => {
      authApiMock.login.and.returnValue(of(mockAuthResponse));
      routerMock.navigate.and.returnValue(Promise.resolve(true));

      await service.login({ email: 'test@example.com', password: 'password123' });

      expect(tokenServiceMock.setTokens).toHaveBeenCalledWith(mockAuthResponse.token);

      const storedUser = JSON.parse(localStorage.getItem('user')!);
      expect(storedUser.id).toBe('123');

      expect(service.currentUser()).toEqual(mockUser);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/catalog']);
    });

    it('should catch and rethrow API errors', async () => {
      authApiMock.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

      await expectAsync(
        service.login({ email: 'wrong@test.com', password: '123' })
      ).toBeRejected();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call clearToken and reset state', () => {
      service.currentUser.set(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout();

      expect(tokenServiceMock.clearToken).toHaveBeenCalled();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Authentication State', () => {
    it('should be authenticated only when user and token exists', () => {
      service.currentUser.set(mockUser);
      tokenServiceMock.isAuthenticated.and.returnValue(true);
      expect(service.isAuthenticated()).toBeTrue();

      service.currentUser.set(null);
      expect(service.isAuthenticated()).toBeFalse();
    });
  });
});
