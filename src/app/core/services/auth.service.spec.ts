import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthApiService } from '../../../api/services/auth.api';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  };

  const mockAuthResponse = {
    token: 'fake-jwt-token',
    user: mockUser
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ],
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created and have null user by default', () => {
    expect(service).toBeTruthy();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  describe('login', () => {
    it('should set user and token on successful login', async () => {
      const loginSpy = spyOn(AuthApiService, 'login').and.returnValue(
        Promise.resolve(mockAuthResponse)
      );

      await service.login({ email: 'test@example.com', password: 'password' });

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();

      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('user')).toContain('johndoe');

      expect(router.navigate).toHaveBeenCalledWith(['/catalog']);
    });

    it('should throw error on failed login', async () => {
      spyOn(AuthApiService, 'login').and.returnValue(
        Promise.reject(new Error('Invalid credentials'))
      );

      try {
        await service.login({ email: 'wrong@test.com', password: '123' });
        fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.message).toBe('Invalid credentials');
        expect(service.currentUser()).toBeNull();
      }
    });
  });

  describe('logout', () => {
    it('should clear signals and localStorage on logout', () => {
      localStorage.setItem('token', 'some-token');
      service.currentUser.set(mockUser);

      service.logout();

      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('session restoration', () => {
    it('should restore user from localStorage if token exists', () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const newService = new AuthService();

      expect(newService.currentUser()).toEqual(mockUser);
      expect(newService.isAuthenticated()).toBeTrue();
    });
  });
});
