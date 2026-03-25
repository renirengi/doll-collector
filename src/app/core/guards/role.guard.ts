import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../../shared/models';


export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const allowedRoles = route.data?.['roles'] as UserRoles[] | undefined;

  if (!authService.isAuthenticated()) {
    console.warn('Доступ запрещен: пользователь не авторизован');
    return router.createUrlTree(['/auth/signin']);
  }

  if (!user) {
    return true;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const hasRole = allowedRoles.includes(user.role);

  if (hasRole) {
    return true;
  }

  console.error(`Доступ запрещен: роль ${user.role} не имеет прав`);
  return router.createUrlTree(['/user/catalog']);
};
