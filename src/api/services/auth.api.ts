import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../../app/shared/models';

/**
 * Service responsible for communicating with the authentication and user endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${API_URL}/auth`;

  /**
   * Registers a new user in the system.
   * @param credentials - The user's registration data (username, email, password, confirmPassword).
   * @returns An Observable indicating the completion of the registration process.
   */
  public signUp(credentials: RegisterCredentials): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/signup`, credentials);
  }

  /**
   * Authenticates a user and retrieves an access token.
   * @param credentials - The user's login data (email and password).
   * @returns An Observable containing the AuthResponse with the access_token.
   */
  public signIn(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/signin`, credentials);
  }

  /**
   * Terminates the current user session.
   * @returns An Observable indicating the successful logout on the server side.
   */
  public logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {});
  }

  /**
   * Exchanges a Refresh Token for a new pair of Access and Refresh tokens.
   * @param refreshToken The current refresh token string.
   * @returns An Observable containing the new AuthResponse.
   */
  public refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, {
      refreshToken,
    });
  }
}
