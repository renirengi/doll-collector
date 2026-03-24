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
    <h1>Sign In</h1>
    <form [formGroup]="signInForm" (ngSubmit)="submit()">
      <label for="email">Email address</label>
      <input
        type="text"
        name="email"
        formControlName="email"
        placeholder="Type your email here"
        autocomplete="email"
      />
      <span class="validation-message">Valid email is required</span>
      <label for="password">Password</label>
      <input
        type="password"
        name="password"
        formControlName="password"
        placeholder="Type your password here"
        autocomplete="current-password"
      />
      <span class="validation-message">Password is required</span>
      <button type="submit">Sign In</button>
    </form>
    <p class="redirect-link">
      Got here by mistake?
      <a routerLink="/auth/signup">Sign Up</a>
    </p>
  `,
  styleUrls: ['../../../../../styles/auth-pages.scss'],
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
  async submit(): Promise<void> {
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
