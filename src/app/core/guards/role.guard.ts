import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRoles } from '../../shared/models';


export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  // Безопасное извлечение ролей
  const allowedRoles = route.data?.['roles'] as UserRoles[] | undefined;

  // 1. Если пользователь вообще не залогинен
  if (!authService.isAuthenticated()) {
    console.warn('Доступ запрещен: пользователь не авторизован');
    return router.createUrlTree(['/auth/signin']);
  }

  // 2. Если мы залогинены, но данные пользователя (user) еще подгружаются
  if (!user) {
    // Если токен есть, но сигнала пользователя еще нет, можно либо подождать,
    // либо пропустить, если доверяем токену. Но лучше проверить роль.
    return true;
  }

  // 3. Проверка ролей, только если они указаны в route.data
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const hasRole = allowedRoles.includes(user.role);

  if (hasRole) {
    return true;
  }

  console.error(`Доступ запрещен: роль ${user.role} не имеет прав`);
  // Редирект на дефолтную страницу, если роль не подходит
  return router.createUrlTree(['/user/catalog']);
};
