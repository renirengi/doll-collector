import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../api/services/auth.api';

/**
 * Service responsible for managing authentication state, including Access Tokens,
 * Refresh Tokens, and the current User ID.
 * Handles synchronous persistence in localStorage and provides reactive signals.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly authApi = inject(AuthApiService);

  /**
   * Internal reactive state signals initialized from localStorage.
   */
  private readonly _token = signal<string | null>(
    localStorage.getItem('token'),
  );
  private readonly _refreshToken = signal<string | null>(
    localStorage.getItem('refreshToken'),
  );
  private readonly _userId = signal<string | null>(
    localStorage.getItem('userId'),
  );

  /**
   * Public read-only signals for application components and services.
   */
  public readonly token = this._token.asReadonly();
  public readonly userId = this._userId.asReadonly();

  /**
   * Returns the current raw value of the Refresh Token.
   */
  public get refreshToken(): string | null {
    return this._refreshToken();
  }

  /**
   * Computed signal that returns true if a valid access token exists.
   */
  public readonly isAuthenticated = computed(() => !!this._token());

  constructor() {}

  /**
   * Updates or purges authentication data in both reactive state and localStorage.
   * * @param token - The new Access Token (or null to clear session).
   * @param refreshToken - The new Refresh Token.
   * @param userId - The UUID of the authenticated user.
   */
  public setTokens(
    token: string | null,
    refreshToken: string | null = null,
    userId: string | null = null,
  ): void {
    if (token) {
      localStorage.setItem('token', token);
      this._token.set(token);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        this._refreshToken.set(refreshToken);
      }

      if (userId) {
        localStorage.setItem('userId', userId);
        this._userId.set(userId);
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      this._token.set(null);
      this._refreshToken.set(null);
      this._userId.set(null);
    }
  }

  /**
   * Purges all session data and resets the authentication state.
   */
  public clearToken(): void {
    this.setTokens(null);
  }

  /**
   * Performs a silent token refresh using the stored Refresh Token.
   * Updates the session state upon success or clears it upon failure.
   * * @returns The new Access Token or null if the refresh failed.
   */
  public async refreshTokenCall(): Promise<string | null> {
    const currentRefresh = this.refreshToken;

    if (!currentRefresh) {
      this.clearToken();
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.authApi.refreshToken(currentRefresh),
      );

      // We maintain the existing userId during a token refresh
      this.setTokens(
        response.access_token,
        response.refreshToken || null,
        this._userId(),
      );

      return response.access_token;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }
}
