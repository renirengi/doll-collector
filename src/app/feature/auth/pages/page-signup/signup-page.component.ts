import { Component, inject, signal } from '@angular/core';
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
import { FormErrorComponent } from '../../../userspace/components/form-error/form-error.component';
@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormErrorComponent],
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
        [class.invalid]="
          signUpForm.get('username')?.invalid &&
          signUpForm.get('username')?.touched
        "
      />
      <app-form-error [control]="signUpForm.get('username')" />

      <label for="email">Email address</label>
      <input
        type="email"
        id="email"
        formControlName="email"
        placeholder="Type your email here"
        autocomplete="email"
        [class.invalid]="
          signUpForm.get('email')?.invalid && signUpForm.get('email')?.touched
        "
      />
      <app-form-error [control]="signUpForm.get('email')" />

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        formControlName="password"
        placeholder="Min. 6 characters"
        [class.invalid]="
          signUpForm.get('password')?.invalid &&
          signUpForm.get('password')?.touched
        "
      />
      <app-form-error [control]="signUpForm.get('password')" />

      <label for="confirmPassword">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        formControlName="confirmPassword"
        placeholder="Repeat your password"
        [class.invalid]="
          (signUpForm.get('confirmPassword')?.invalid ||
            signUpForm.hasError('passwordMismatch')) &&
          signUpForm.get('confirmPassword')?.touched
        "
      />
      <app-form-error
        [control]="signUpForm.get('confirmPassword')"
        [groupContext]="signUpForm"
      />

      <button type="submit" [disabled]="isLoading()">
        {{ isLoading() ? 'Creating account...' : 'Sign Up' }}
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

  public readonly isLoading = signal(false);

  public readonly signUpForm = this.fb.group(
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

  public async submit(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

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
      await this.authService.login({ email: email!, password: password! });
    } catch (error) {
      this.messageService.showError('Registration failed. Check your data.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
