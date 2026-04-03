import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../api/services/auth.api';
import { TokenService } from './token.services';
import { UserService } from './user.service';
import { LoginCredentials, AuthResponse } from '../../shared/models';

/**
 * Core authentication service coordinating API calls and session state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);

  public readonly currentUser = signal<any>(null);
  public readonly isAuthenticated = this.tokenService.isAuthenticated;

  constructor() {
    this.restoreSession();
  }

  /**
   * Handles user login flow.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      // 1. Execute request
      const response: AuthResponse = await firstValueFrom(
        this.authApi.signIn(credentials),
      );

      // DEBUG: If you don't see this, the code crashed BEFORE this line
      console.log('[AuthService] Login response received:', response);

      if (response.access_token && response.userId) {
        // 2. Save to TokenService (which updates localStorage and signals)
        this.tokenService.setTokens(
          response.access_token,
          response.refreshToken || null,
          response.userId,
        );

        // 3. Fetch user data
        await this.hydrateUserProfile(response.userId);

        // 4. Navigate
        await this.router.navigate(['/user/catalog']);
      }
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * Restores session from storage on app init/refresh.
   */
  private async restoreSession(): Promise<void> {
    const token = this.tokenService.token();
    const userId = this.tokenService.userId();

    if (token && userId) {
      await this.hydrateUserProfile(userId);
    }
  }

  /**
   * Loads profile data into the signal.
   */
  public async hydrateUserProfile(userId: string): Promise<void> {
    try {
      const user = await this.userService.getProfileSync(userId);
      this.currentUser.set(user);
    } catch (error) {
      console.error('[AuthService] Profile sync failed:', error);
    }
  }

  /**
   * Clears session and redirects to login.
   */
  public logout(): void {
    this.tokenService.clearToken();
    this.currentUser.set(null);
    this.router.navigate(['/auth/signin']);
  }
}
