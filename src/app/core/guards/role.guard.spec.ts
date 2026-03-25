import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../../shared/models';
import { signal } from '@angular/core';

describe('RoleGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const executeGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => RoleGuard(route, state));

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: signal(null),
      isAuthenticated: signal(false)
    });
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow access if user has required role', () => {
    (authServiceSpy as any).currentUser.set({ role: UserRoles.Admin });
    (authServiceSpy as any).isAuthenticated.set(true);

    const route = { data: { roles: [UserRoles.Admin, UserRoles.Client] } } as any;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state);

    expect(result).toBeTrue();
  });

  it('should redirect to signin if user is not authenticated', () => {
    (authServiceSpy as any).currentUser.set(null);
    (authServiceSpy as any).isAuthenticated.set(false);

    const route = { data: { roles: [UserRoles.Admin] } } as any;
    const state = {} as RouterStateSnapshot;
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    const result = executeGuard(route, state);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/signin']);
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to catalog if user has insufficient permissions', () => {
    (authServiceSpy as any).currentUser.set({ role: UserRoles.Client });
    (authServiceSpy as any).isAuthenticated.set(true);

    const route = { data: { roles: [UserRoles.Admin] } } as any;
    const state = {} as RouterStateSnapshot;
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    const result = executeGuard(route, state);

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/user/catalog']);
    expect(result).toBe(mockUrlTree);
  });

  it('should allow access for CLIENT role if it is in allowed list', () => {
    (authServiceSpy as any).currentUser.set({ role: UserRoles.Client });
    (authServiceSpy as any).isAuthenticated.set(true);

    const route = { data: { roles: [UserRoles.Client] } } as any;
    const state = {} as RouterStateSnapshot;

    const result = executeGuard(route, state);

    expect(result).toBeTrue();
  });
});
