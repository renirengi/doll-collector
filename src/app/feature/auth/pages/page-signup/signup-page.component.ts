import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthApiService } from '../../../../../api/services/auth.api';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from '../../../../core/services/message-service.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Sign Up</h1>
    <form [formGroup]="signUpForm" (ngSubmit)="submit()">
      <label for="username">User name</label>
      <input
        type="text"
        id="username"
        formControlName="username"
        placeholder="Type your name here"
        autocomplete="username"
      />
      @if (isFieldInvalid('username')) {
        <span class="validation-message"
          >Valid name is required (min 6 chars)</span
        >
      }

      <label for="email">Email address</label>
      <input
        type="email"
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
        placeholder="Min. 6 characters"
      />
      @if (isFieldInvalid('password')) {
        <span class="validation-message"
          >Password must be at least 6 characters</span
        >
      }

      <label for="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        formControlName="confirmPassword"
        placeholder="Repeat your password"
      />
      @if (
        signUpForm.hasError('passwordMismatch') &&
        signUpForm.get('confirmPassword')?.touched
      ) {
        <span class="validation-message">Passwords do not match</span>
      }

      <button type="submit" [disabled]="isLoading">
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>

    <p class="redirect-link">
      Got here by mistake?
      <a routerLink="/auth/signin">Sign In</a>
    </p>
  `,
  styleUrls: ['../../../../../styles/auth-pages.scss'],
})
export class SignUpPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  isLoading = false;

  signUpForm = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    return password &&
      confirmPassword &&
      password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  async submit(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.messageService.showError('Please fill in all fields correctly.');
      return;
    }

    this.isLoading = true;

    try {
      const { username, email, password, confirmPassword } =
        this.signUpForm.getRawValue();
      await firstValueFrom(
        this.authApi.signUp({
          username: username!,
          email: email!,
          password: password!,
          confirmPassword: confirmPassword!,
        }),
      );

      this.messageService.showSuccess('Account created successfully!');

      // 2. Автоматический вход через AuthService
      await this.authService.login({
        email: email!,
        password: password!,
      });
    } catch (error) {
      console.error('Registration error:', error);
      this.messageService.showError(
        'Registration failed. This email or username might already be in use.',
      );
    } finally {
      this.isLoading = false;
    }
  }
}
