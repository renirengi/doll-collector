import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthApiService } from '../../../api/services/auth.api';
import { firstValueFrom } from 'rxjs';

/**
 * Service responsible for managing authentication tokens (Access and Refresh).
 * Handles persistence in localStorage and provides reactive signals.
 */
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly authApi = inject(AuthApiService);

  // Undefined = loading, null = no token, string = token exists
  private readonly _token = signal<string | null | undefined>(undefined);
  private readonly _refreshToken = signal<string | null>(null);

  /**
   * Reactive signal of the current Access Token.
   */
  public readonly token = this._token.asReadonly();

  /**
   * Current Refresh Token value.
   */
  public get refreshToken(): string | null {
    return this._refreshToken();
  }

  /**
   * Checks if the user has an active session.
   */
  public readonly isAuthenticated = computed(() => !!this._token());

  constructor() {
    this.initializeTokens();
  }

  /**
   * Loads tokens from localStorage on startup.
   */
  private initializeTokens(): void {
    const savedToken = localStorage.getItem('token');
    const savedRefreshToken = localStorage.getItem('refreshToken');

    this._token.set(savedToken);
    this._refreshToken.set(savedRefreshToken);
  }

  /**
   * Updates Access and Refresh tokens in state and storage.
   */
  public setTokens(token: string | null, refreshToken: string | null = null): void {
    if (token) {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }

    this._token.set(token);
    if (refreshToken) this._refreshToken.set(refreshToken);
  }

  /**
   * Clears session data (e.g., on logout or expired session).
   */
  public clearToken(): void {
    this.setTokens(null);
  }

  /**
   * Performs a silent refresh call to the API.
   * Called by the RefreshInterceptor when a 401 error occurs.
   */
  public async refreshTokenCall(): Promise<string | null> {
    const currentRefresh = this.refreshToken;

    if (!currentRefresh) {
      this.clearToken();
      return null;
    }

    try {
      // We use firstValueFrom because this is a single "one-shot" request
      const response = await firstValueFrom(this.authApi.refreshToken(currentRefresh));

      this.setTokens(response.token, response.refreshToken);
      return response.token;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }
}
