import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../shared/models';

/**
 * SignInPageComponent handles user authentication by interacting with AuthService.
 * It manages the login form state, validation, and submission process.
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
        id="email"
        formControlName="email"
        placeholder="Type your email here"
        autocomplete="email"
      />
      @if (isFieldInvalid('email')) {
        <span class="validation-message">Valid email is required</span>
      }

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        formControlName="password"
        placeholder="Type your password here"
        autocomplete="current-password"
      />
      @if (isFieldInvalid('password')) {
        <span class="validation-message"
          >Password is required (min 6 characters)</span
        >
      }

      <button type="submit" [disabled]="isLoading()">
        {{ isLoading() ? 'Signing In...' : 'Sign In' }}
      </button>
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Reactive state for the loading spinner or button disabling.
   */
  public readonly isLoading = signal<boolean>(false);

  /**
   * Form group definition with validation rules.
   */
  public readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Checks if a specific form field is invalid and has been interacted with.
   * @param fieldName The name of the form control to validate.
   * @returns boolean indicating if the field should show an error.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Processes the login form submission.
   * Orchestrates the call to AuthService and handles navigation or errors.
   */
  public async submit(): Promise<void> {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    try {
      const credentials: LoginCredentials = {
        email: this.signInForm.value.email!,
        password: this.signInForm.value.password!,
      };

      await this.authService.login(credentials);
    } catch (error) {
      console.error('[SignInPage] Authentication failed:', error);
      alert('Login failed. Please check your credentials.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
