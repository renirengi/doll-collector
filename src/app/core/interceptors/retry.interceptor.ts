import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

/**
 * Automatically retries failed requests to handle transient network issues.
 * Retries twice with a delay (1s, then 2s).
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // We usually don't want to retry POST/PUT/DELETE to avoid duplicate actions,
  // but for a simple store, we can apply it or filter by method.
  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => timer(retryCount * 1000),
    })
  );
};
