import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../api/services/auth.api';
import { TokenService } from './token.services';
import { UserService } from './user.service';
import { LoginCredentials, AuthResponse, User } from '../../shared/models';
import { MessageService } from './message-service.service';

/**
 * Core authentication service coordinating API calls and session state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);

  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = this.tokenService.isAuthenticated;

  constructor() {
    this.restoreSession();
  }

  /**
   * Handles user login flow.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response: AuthResponse = await firstValueFrom(
        this.authApi.signIn(credentials),
      );

      if (response.access_token && response.userId) {
        this.tokenService.setTokens(
          response.access_token,
          response.refreshToken || null,
          response.userId,
        );
        await this.hydrateUserProfile(response.userId);
        this.messageService.showSuccess('Welcome back!');
        await this.router.navigate(['/user/catalog']);
      }
    } catch (error) {
      console.error('[AuthService] Login failed:', error);

      this.messageService.showError(
        'Invalid email or password. Please try again.',
      );

      this.tokenService.clearToken();
      this.currentUser.set(null);

      if (!this.router.url.includes('/auth/signin')) {
        await this.router.navigate(['/auth/signin']);
      }

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
      this.messageService.showError('Failed to load user profile.');
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
