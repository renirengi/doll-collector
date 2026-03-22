import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../api/services/auth.api';
import {
  LoginCredentials,
  User,
  AuthResponse,
} from '../../shared/models/auth.model';
import { TokenService } from './token.services';

/**
 * High-level service managing user session and authentication state.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);

  /**
   * Current authenticated user profile.
   */
  public readonly currentUser = signal<User | null>(null);

  /**
   * Reactive helper to check if the user is authenticated.
   * Derived from the presence of both a user profile and a valid token.
   */
  public readonly isAuthenticated = computed(
    () => !!this.currentUser() && this.tokenService.isAuthenticated(),
  );

  constructor() {
    this.restoreSession();
  }

  /**
   * Authenticates user, updates token and profile state, then navigates to catalog.
   * @param credentials Email and password.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      // Convert Observable to Promise to keep the async/await flow
      const response = await firstValueFrom(this.authApi.signIn(credentials));

      this.setSession(response);
      await this.router.navigate(['/catalog']);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Clears all session data and redirects to the login page.
   */
  public logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Synchronizes AuthResponse data with storage and internal signals.
   */
  private setSession(auth: AuthResponse): void {
    this.tokenService.setTokens(auth.access_token, auth.refreshToken || null);

    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      this.currentUser.set(auth.user);
    }
  }

  /**
   * Restores session from storage on service initialization.
   */
  private restoreSession(): void {
    const savedUser = localStorage.getItem('user');

    // We only restore the user signal if the TokenService already has a token.
    // (TokenService initializes itself from localStorage in its constructor).
    if (savedUser && this.tokenService.token()) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch {
        this.logout();
      }
    }
  }
}
