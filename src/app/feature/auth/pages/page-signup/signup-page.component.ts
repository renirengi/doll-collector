import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TokenService } from '../../../../core/services/token.services';
import { AuthApiService } from '../../../../../api/services/auth.api';

/**
 * SignUpPageComponent handles new user registration.
 * Provides a dedicated form to create an account and access the collection.
 */
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <header>
          <h1>Sign Up</h1>
          <p class="subtitle">
            Create an account to start your doll collection.
          </p>
        </header>

        <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()">
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
              <span class="error-text">Please enter a valid email address</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Min. 6 characters"
              [class.input-error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="error-text"
                >Password must be at least 6 characters long</span
              >
            }
          </div>

          <div class="actions">
            <button type="submit" [disabled]="signUpForm.invalid || isLoading">
              {{ isLoading ? 'Creating account...' : 'Create Account' }}
            </button>
          </div>
        </form>

        <footer class="auth-footer">
          <p>
            Already have an account? <a routerLink="/auth/signin">Sign In</a>
          </p>
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
export class SignUpPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  isLoading = false;

  signUpForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Checks if a specific field has validation errors after user interaction.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handles account creation.
   * After successful sign up, it automatically logs the user in.
   */
  async onSubmit(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const credentials = {
        email: this.signUpForm.value.email!,
        password: this.signUpForm.value.password!,
      };

      // 1. Call the SignUp endpoint
      await firstValueFrom(this.authApi.signUp(credentials));

      // 2. Many APIs automatically log in after signup,
      // or we can call signIn here to get the token.
      const loginRes = await firstValueFrom(this.authApi.signIn(credentials));
      this.tokenService.setTokens(loginRes.access_token);

      // 3. Move to collection
      await this.router.navigate(['/dolls']);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. This email might already be in use.');
    } finally {
      this.isLoading = false;
    }
  }
}
