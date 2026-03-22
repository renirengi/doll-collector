import { HttpInterceptorFn } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { refreshInterceptor } from './refresh.interceptor';
import { retryInterceptor } from './retry.interceptor';

/**
 * A centralized array of interceptors to be used in the HttpClient configuration.
 * Order of execution: Auth -> Refresh -> Retry
 */
export const coreInterceptors: HttpInterceptorFn[] = [
  authInterceptor,
  refreshInterceptor,
  retryInterceptor
];

export * from './auth.interceptor';
export * from './retry.interceptor';
export * from './refresh.interceptor';
