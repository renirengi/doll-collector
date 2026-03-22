import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { filter, switchMap, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { TokenService } from '../services/token.services';

/**
 * Interceptor that injects the JWT token into the Authorization header.
 * It waits for the token signal to be initialized before proceeding with the request.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // We convert the signal to an observable to use RxJS operators.
  // We filter out 'undefined' to wait for the initial check from localStorage.
  return toObservable(tokenService.token).pipe(
    filter((token) => token !== undefined),
    take(1), // Important: complete the stream after getting the first valid value
    switchMap((token) => {
      // If a token exists, we clone the request and add the header.
      // Otherwise, we pass the original request (e.g., for login/register).
      const authReq = token ? addAuthHeader(req, token) : req;
      return next(authReq);
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
