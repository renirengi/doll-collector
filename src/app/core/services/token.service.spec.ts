import { TestBed } from '@angular/core/testing';
import { AuthApiService } from '../../../api/services/auth.api';
import { of, throwError } from 'rxjs';
import { AuthResponse } from '../../shared/models';
import { TokenService } from './token.services';

/**
 * Unit tests for TokenService.
 * Validates token persistence, reactive state, and silent refresh logic.
 */
describe('TokenService', () => {
  let service: TokenService;
  let authApiMock: jasmine.SpyObj<AuthApiService>;

  const mockResponse: AuthResponse = {
    access_token: 'new-access-token',
    refreshToken: 'new-refresh-token',
    userId: 'be19f98f-84bc-4fa4-a7c9-a5c8dc3a0b68',
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
    it('should load tokens and userId from localStorage if they exist', () => {
      localStorage.setItem('token', 'saved-access');
      localStorage.setItem('refreshToken', 'saved-refresh');
      localStorage.setItem('userId', 'saved-user-id');

      service = TestBed.inject(TokenService);

      expect(service.token()).toBe('saved-access');
      expect(service.userId()).toBe('saved-user-id');
      expect(service.refreshToken).toBe('saved-refresh');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should have null state if localStorage is empty', () => {
      service = TestBed.inject(TokenService);

      expect(service.token()).toBeNull();
      expect(service.userId()).toBeNull();
      expect(service.refreshToken).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('Token Management', () => {
    beforeEach(() => {
      service = TestBed.inject(TokenService);
    });

    it('should update storage and signals when setTokens is called with userId', () => {
      service.setTokens('access', 'refresh', 'user-123');

      expect(localStorage.getItem('token')).toBe('access');
      expect(localStorage.getItem('refreshToken')).toBe('refresh');
      expect(localStorage.getItem('userId')).toBe('user-123');

      expect(service.token()).toBe('access');
      expect(service.userId()).toBe('user-123');
      expect(service.refreshToken).toBe('refresh');
    });

    it('should clear everything including userId when clearToken is called', () => {
      service.setTokens('access', 'refresh', 'user-123');
      service.clearToken();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();

      expect(service.token()).toBeNull();
      expect(service.userId()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('refreshTokenCall', () => {
    beforeEach(() => {
      service = TestBed.inject(TokenService);
    });

    it('should call API and update tokens while maintaining the current userId', async () => {
      service.setTokens('old-access', 'old-refresh', 'existing-user-id');
      authApiMock.refreshToken.and.returnValue(of(mockResponse));

      const result = await service.refreshTokenCall();

      expect(authApiMock.refreshToken).toHaveBeenCalledWith('old-refresh');
      expect(result).toBe('new-access-token');
      expect(service.token()).toBe('new-access-token');
      expect(service.userId()).toBe('existing-user-id'); // Check that ID persists
      expect(localStorage.getItem('token')).toBe('new-access-token');
    });

    it('should return null and clear session if no refresh token is present', async () => {
      service.setTokens(null, null, null);

      const result = await service.refreshTokenCall();

      expect(result).toBeNull();
      expect(authApiMock.refreshToken).not.toHaveBeenCalled();
    });

    it('should clear session and return null if refresh API call fails', async () => {
      service.setTokens('access', 'refresh', 'user-id');
      authApiMock.refreshToken.and.returnValue(
        throwError(() => new Error('Refresh failed')),
      );

      const result = await service.refreshTokenCall();

      expect(result).toBeNull();
      expect(service.token()).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });
  });
});
