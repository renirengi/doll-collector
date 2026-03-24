import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, filter, switchMap, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { TokenService } from '../services/token.services';

/**
 * Interceptor that injects the JWT token into the Authorization header.
 * It waits for the token signal to be initialized before proceeding with the request.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const tokenService = inject(TokenService);

  /**
   * We convert the signal to an observable to use RxJS operators.
   * We filter out 'undefined' to wait for the initial check from localStorage.
   * We use take(1) to ensure the stream completes after obtaining the current token state.
   */
  return toObservable(tokenService.token).pipe(
    filter((token): token is string | null => token !== undefined),
    take(1),
    switchMap((token) => {
      // We only add the header if the token exists and the request is local/API-related.
      // This prevents leaking the token to third-party domains.
      if (
        token &&
        (req.url.startsWith('/') ||
          req.url.includes('localhost') ||
          req.url.includes('127.0.0.1'))
      ) {
        const authReq = addAuthHeader(req, token);
        return next(authReq);
      }

      // Otherwise, we pass the original request (e.g., for login, register, or external assets).
      return next(req);
    }),
  );
};

/**
 * Helper function to safely clone the request and set the Authorization header.
 * @param req Original HttpRequest
 * @param token JWT string
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
