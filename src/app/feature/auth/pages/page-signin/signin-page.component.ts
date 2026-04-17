import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials } from '../../../../shared/models';
import { MessageService } from '../../../../core/services/message-service.service';
import { FormErrorComponent } from '../../../userspace/components/form-error/form-error.component';

@Component({
  selector: 'app-signin-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormErrorComponent],
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
        [class.invalid]="
          signInForm.get('email')?.invalid && signInForm.get('email')?.touched
        "
      />
      <app-form-error [control]="signInForm.get('email')" />

      <label for="password">Password</label>
      <input
        type="password"
        id="password"
        formControlName="password"
        placeholder="Type your password here"
        autocomplete="current-password"
        [class.invalid]="
          signInForm.get('password')?.invalid &&
          signInForm.get('password')?.touched
        "
      />
      <app-form-error [control]="signInForm.get('password')" />

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
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  public readonly isLoading = signal<boolean>(false);

  public readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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
      this.messageService.showError(
        'Login failed. Please check your credentials.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
