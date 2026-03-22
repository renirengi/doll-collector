import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  filter,
  from,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { TokenService } from '../services/token.services';

/**
 * State to track if a refresh request is currently in progress.
 */
let isRefreshing = false;

/**
 * Subject to notify all queued requests once the new token is available.
 */
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Interceptor that catches 401 Unauthorized errors and attempts to perform a silent refresh.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 and have a refresh token, try to recover
      if (error.status === 401 && tokenService.refreshToken) {
        return handle401Error(req, next, tokenService);
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Handles the 401 error logic.
 */
function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: TokenService,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return from(tokenService.refreshTokenCall()).pipe(
      switchMap((newToken) => {
        isRefreshing = false;

        if (!newToken) {
          tokenService.clearToken();
          return throwError(
            () => new Error('Session expired: Refresh failed.'),
          );
        }

        refreshTokenSubject.next(newToken);

        return next(addAuthHeader(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        tokenService.clearToken();
        return throwError(() => err);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((newToken) => next(addAuthHeader(req, newToken!))),
    );
  }
}

/**
 * Clones the request with a fresh Authorization header.
 */
function addAuthHeader(
  req: HttpRequest<unknown>,
  token: string,
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}
