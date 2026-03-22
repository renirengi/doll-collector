import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TokenService } from '../../../../core/services/token.services';
import { AuthApiService } from '../../../../../api/services/auth.api';

/**
 * SignInPageComponent handles user authentication.
 * It uses a single-file approach with inline styles and reactive forms.
 */
@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <header>
          <h1>Sign In</h1>
          <p class="subtitle">Welcome back! Please enter your details.</p>
        </header>

        <form [formGroup]="signInForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="example@mail.com"
              [class.input-error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="error-text">A valid email is required</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              [class.input-error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-text"
                >Password must be at least 6 characters</span
              >
            }
          </div>

          <div class="actions">
            <button type="submit" [disabled]="signInForm.invalid || isLoading">
              {{ isLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </div>
        </form>

        <footer class="auth-footer">
          <p>Don't have an account? <a routerLink="/auth/signup">Sign Up</a></p>
        </footer>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .auth-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 90vh;
        padding: 1rem;
        background-color: #f9f9f9;
      }

      .auth-card {
        background: #ffffff;
        padding: 2.5rem;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        width: 100%;
        max-width: 420px;
      }

      h1 {
        margin: 0 0 0.5rem;
        font-size: 2rem;
        color: #1a1a1a;
        text-align: center;
      }

      .subtitle {
        color: #666;
        margin-bottom: 2rem;
        font-size: 0.95rem;
        text-align: center;
      }

      .form-group {
        margin-bottom: 1.25rem;
        display: flex;
        flex-direction: column;
      }

      label {
        margin-bottom: 0.5rem;
        font-weight: 500;
        font-size: 0.9rem;
        color: #333;
      }

      input {
        padding: 0.75rem 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        outline: none;
        transition: all 0.2s ease-in-out;
      }

      input:focus {
        border-color: #4a90e2;
        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
      }

      input.input-error {
        border-color: #ff4d4f;
      }

      .error-text {
        color: #ff4d4f;
        font-size: 0.8rem;
        margin-top: 0.4rem;
      }

      .actions {
        margin-top: 2rem;
      }

      button {
        width: 100%;
        padding: 0.85rem;
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      button:hover:not(:disabled) {
        opacity: 0.9;
      }

      button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }

      .auth-footer {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.9rem;
        color: #666;
      }

      .auth-footer a {
        color: #4a90e2;
        text-decoration: none;
        font-weight: 600;
      }

      .auth-footer a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class SignInPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  isLoading = false;

  signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Helper to check if a form field is invalid and touched.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handles the sign-in form submission.
   */
  async onSubmit(): Promise<void> {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      // Credentials extracted from form
      const credentials = {
        email: this.signInForm.value.email!,
        password: this.signInForm.value.password!,
      };

      // 1. Call API using the signin endpoint
      const response = await firstValueFrom(this.authApi.signIn(credentials));

      // 2. Persist access_token via TokenService
      this.tokenService.setTokens(response.access_token);

      // 3. Navigate to the main application area
      await this.router.navigate(['/user/catalog']);
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Login failed. Please check your email and password.');
    } finally {
      this.isLoading = false;
    }
  }
}
