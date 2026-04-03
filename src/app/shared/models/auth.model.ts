import { User } from './user.model';

/**
 * Credentials for the login request
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Credentials for the registration request
 * Based on POST /auth/signup schema
 */
export interface RegisterCredentials extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

/**
 * Successful authentication response
 * Note: backend returns only access_token by default
 */
export interface AuthResponse {
  access_token: string;
  refreshToken?: string;
  userId: string;
}

/**
 * Common structure for API errors
 */
export interface AuthError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

/**
 * Type guard to check if a response is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error
  );
}
