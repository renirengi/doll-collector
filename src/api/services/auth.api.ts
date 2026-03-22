import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import { LoginCredentials, AuthResponse, User } from '../../app/shared/models/auth.model';

/**
 * Service responsible for communicating with the authentication and user endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${API_URL}/auth`;

  /**
   * Authenticates a user with the provided credentials.
   * * @param credentials - The user's email and password.
   * @returns An Observable containing the authentication token and user profile.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials);
  }

  /**
   * Retrieves a specific user's profile information by their unique identifier.
   * * @param id - The UUID or unique string ID of the user.
   * @returns An Observable containing the User profile data.
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${API_URL}/user/${id}`);
  }

  /**
   * Exchanges a Refresh Token for a new pair of Access and Refresh tokens.
   * @param refreshToken The current refresh token string.
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    // Usually, the refresh token is sent in the body or a specific header
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, { refreshToken });
  }

  /**
   * Fetches the profile of the currently authenticated user based on the active session token.
   * Usually used during app initialization to restore user state.
   * * @returns An Observable containing the current User's data.
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.authUrl}/me`);
  }
}
