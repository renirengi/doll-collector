import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../api/services/auth.api';
import { LoginCredentials, AuthResponse, User } from '../../shared/models';
import { TokenService } from './token.services';

/**
 * Service responsible for managing user authentication state,
 * session persistence, and authorization flow.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);

  /**
   * Reactive signal holding the current authenticated user's profile.
   */
  public readonly currentUser = signal<User | null>(null);

  /**
   * Computed signal that determines if the user is authenticated
   * based on the validity of the access token.
   */
  public readonly isAuthenticated = computed(() =>
    this.tokenService.isAuthenticated(),
  );

  constructor() {
    this.restoreSession();
  }

  /**
   * Executes the login flow: authenticates credentials, stores session data,
   * and navigates to the user workspace.
   *
   * @param credentials - User's email and password.
   * @throws Error if authentication fails.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await firstValueFrom(this.authApi.signIn(credentials));

      // Update session state before navigation to prevent Guard race conditions
      this.setSession(response);

      // Navigate to the primary user entry point
      await this.router.navigate(['/user/catalog']);
    } catch (error) {
      console.error('Login flow failed:', error);
      throw error;
    }
  }

  /**
   * Clears all authentication artifacts and redirects to the sign-in page.
   */
  public logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/auth/signin']);
  }

  /**
   * Internal helper to synchronize the AuthResponse with local storage and signals.
   *
   * @param auth - The response object containing tokens and optionally user data.
   */
  private setSession(auth: AuthResponse): void {
    this.tokenService.setTokens(auth.access_token, auth.refreshToken || null);

    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      this.currentUser.set(auth.user);
    } else {
      // If the backend doesn't return the user object, fetch it manually
      this.fetchUserProfile();
    }
  }

  /**
   * Fetches the detailed user profile from the API if not provided during login.
   * Should be implemented via an 'auth/me' or 'user/profile' endpoint.
   */
  private async fetchUserProfile(): Promise<void> {
    // Logic for fetching profile via API would go here.
    // e.g., const profile = await firstValueFrom(this.authApi.getMe());
    // this.currentUser.set(profile);
  }

  /**
   * Rehydrates the user signal from local storage on service initialization
   * if a valid session token exists.
   */
  private restoreSession(): void {
    const savedUser = localStorage.getItem('user');

    if (savedUser && this.tokenService.token()) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to restore session:', error);
        this.logout();
      }
    }
  }
}
