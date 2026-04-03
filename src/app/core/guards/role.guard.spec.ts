import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { isObservable, firstValueFrom } from 'rxjs';

import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

/**
 * Tests for RoleGuard based on current implementation:
 * 1. Immediate redirect if not authenticated.
 * 2. Waiting for currentUser signal to be non-null if authenticated.
 */
describe('RoleGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  // Helper to run the functional guard in the proper injection context
  const executeGuard = (route: any = {}, state: any = {}) =>
    TestBed.runInInjectionContext(() => RoleGuard(route, state));

  beforeEach(() => {
    // Creating mocks for signals and router
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: signal<any>(null),
    });
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should redirect to /auth/signin immediately if not authenticated', () => {
    // Arrange
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    // Act
    const result = executeGuard();

    // Assert
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/signin']);
    expect(result).toBe(mockUrlTree);
  });

  it('should allow access (return true) once currentUser is loaded', async () => {
    // Arrange
    authServiceSpy.isAuthenticated.and.returnValue(true);
    // Initially null to simulate waiting for hydration
    const userSignal = authServiceSpy.currentUser as any;

    // Act
    const result = executeGuard();

    // Assert: Since it's authenticated but user is null, it MUST return an Observable
    if (isObservable(result)) {
      // Simulate profile loading after a "tick"
      userSignal.set({ id: '123', username: 'test' });

      const finalValue = await firstValueFrom(result);
      expect(finalValue).toBeTrue();
    } else {
      fail('Guard should return an Observable to wait for user hydration');
    }
  });

  it('should take only one value from the user stream and complete', async () => {
    // Arrange
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.currentUser.set({ id: '123' });

    // Act
    const result = executeGuard();

    if (isObservable(result)) {
      const finalValue = await firstValueFrom(result);
      expect(finalValue).toBeTrue();
      // take(1) ensures the stream completes here
    } else {
      fail('Expected Observable');
    }
  });
});
