import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../api/services/auth.api';
import { LoginCredentials, User, AuthResponse } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  /**
   * Current authenticated user. Initialized as null.
   */
  public readonly currentUser = signal<User | null>(null);

  /**
   * Reactive helper to check if the user is logged in.
   */
  public readonly isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    /**
     * Optional: Auto-login logic if token exists in localStorage.
     * You can call a 'me' or 'profile' endpoint here.
     */
    this.restoreSession();
  }

  /**
   * Performs login, stores the JWT, and updates the user signal.
   * @param credentials - email and password.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response: AuthResponse = await AuthApiService.login(credentials);

      this.setSession(response);
      this.router.navigate(['/catalog']);
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to handle error messages in the UI
    }
  }

  /**
   * Logs out the user by clearing local storage and resetting the signal.
   */
  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Updates the session data in localStorage and the signal.
   */
  private setSession(auth: AuthResponse): void {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
    this.currentUser.set(auth.user);
  }

  /**
   * Attempts to restore the user session from localStorage on app start.
   */
  private restoreSession(): void {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      this.currentUser.set(JSON.parse(savedUser));
    }
  }
}
