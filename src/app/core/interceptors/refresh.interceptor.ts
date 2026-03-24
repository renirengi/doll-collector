import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  throwError,
  from,
  switchMap,
  BehaviorSubject,
  filter,
  take,
  finalize,
} from 'rxjs';
import { TokenService } from '../services/token.services';

/**
 * States exported for testing purposes to allow manual reset between specs.
 */
export const isRefreshing$ = new BehaviorSubject<boolean>(false);
export const refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isAuthRequest =
        req.url.includes('/login') || req.url.includes('/refresh');

      if (!isUnauthorized || isAuthRequest) {
        return throwError(() => error);
      }

      if (!isRefreshing$.value) {
        isRefreshing$.next(true);
        refreshTokenSubject$.next(null);

        return from(tokenService.refreshTokenCall()).pipe(
          switchMap((newToken) => {
            if (newToken) {
              refreshTokenSubject$.next(newToken);
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                }),
              );
            }
            return throwError(() => error);
          }),
          catchError((err) => {
            tokenService.clearToken();
            return throwError(() => err);
          }),
          finalize(() => {
            isRefreshing$.next(false);
          }),
        );
      } else {
        // Wait for the first request to finish refreshing
        return refreshTokenSubject$.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) =>
            next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${newToken!}` },
              }),
            ),
          ),
        );
      }
    }),
  );
};
