import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If no token at all - dead end
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/signin']);
  }
  // If authenticated but user is still null, we WAIT
  return toObservable(auth.currentUser).pipe(
    filter((user) => user !== null), //
    take(1),
    map(() => true),
  );
};
