/**
 * Core User profile data from the server
 */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

/**
 * Credentials for the login request
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Successful authentication response
 */
export interface AuthResponse {
  access_token: string;
  refreshToken?: string;
  user?: User;
}

/**
 * Common structure for API errors
 */
export interface AuthError {
  message: string;
  statusCode: number;
}
