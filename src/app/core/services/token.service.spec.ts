import { TestBed } from '@angular/core/testing';
import { AuthApiService } from '../../../api/services/auth.api';
import { of, throwError } from 'rxjs';
import { AuthResponse } from '../../shared/models/auth.model';
import { TokenService } from './token.services';

describe('TokenService', () => {
  let service: TokenService;
  let authApiMock: jasmine.SpyObj<AuthApiService>;

  const mockResponse: AuthResponse = {
    access_token: 'new-access-token',
    refreshToken: 'new-refresh-token',
    user: {} as any,
  };

  beforeEach(() => {
    authApiMock = jasmine.createSpyObj('AuthApiService', ['refreshToken']);

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        TokenService,
        { provide: AuthApiService, useValue: authApiMock },
      ],
    });
  });

  describe('Initialization', () => {
    it('should load tokens from localStorage if they exist', () => {
      localStorage.setItem('token', 'saved-access');
      localStorage.setItem('refreshToken', 'saved-refresh');

      service = TestBed.inject(TokenService);

      expect(service.token()).toBe('saved-access');
      expect(service.refreshToken).toBe('saved-refresh');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should have undefined/null state if localStorage is empty', () => {
      service = TestBed.inject(TokenService);

      expect(service.token()).toBeNull();
      expect(service.refreshToken).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('Token Management', () => {
    beforeEach(() => {
      service = TestBed.inject(TokenService);
    });

    it('should update storage and signals when setTokens is called', () => {
      service.setTokens('access', 'refresh');

      expect(localStorage.getItem('token')).toBe('access');
      expect(localStorage.getItem('refreshToken')).toBe('refresh');
      expect(service.token()).toBe('access');
      expect(service.refreshToken).toBe('refresh');
    });

    it('should clear everything when clearToken is called', () => {
      service.setTokens('access', 'refresh');
      service.clearToken();

      expect(localStorage.getItem('token')).toBeNull();
      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('refreshTokenCall', () => {
    beforeEach(() => {
      service = TestBed.inject(TokenService);
    });

    it('should call API and update tokens on success', async () => {
      service.setTokens('old-access', 'old-refresh');
      authApiMock.refreshToken.and.returnValue(of(mockResponse));

      const result = await service.refreshTokenCall();

      expect(authApiMock.refreshToken).toHaveBeenCalledWith('old-refresh');
      expect(result).toBe('new-access-token');
      expect(service.token()).toBe('new-access-token');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    });

    it('should return null and clear session if no refresh token is present', async () => {
      service.setTokens(null, null);

      const result = await service.refreshTokenCall();

      expect(result).toBeNull();
      expect(authApiMock.refreshToken).not.toHaveBeenCalled();
    });

    it('should clear session and return null if API call fails', async () => {
      service.setTokens('access', 'refresh');
      authApiMock.refreshToken.and.returnValue(
        throwError(() => new Error('Expired')),
      );

      const result = await service.refreshTokenCall();

      expect(result).toBeNull();
      expect(service.token()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
