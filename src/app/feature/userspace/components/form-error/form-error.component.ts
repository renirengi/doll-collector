import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  standalone: true,
  template: `
    @if (
      control &&
      control.touched &&
      (control.invalid || groupContext?.hasError('passwordMismatch'))
    ) {
      <div class="error-container">
        @if (control.errors?.['required']) {
          <span class="error-text">This field is required</span>
        } @else if (control.errors?.['minlength']) {
          <span class="error-text">
            Too short! Needs
            {{
              control.errors?.['minlength'].requiredLength -
                control.errors?.['minlength'].actualLength
            }}
            more characters
          </span>
        }

        @if (groupContext?.hasError('passwordMismatch')) {
          <span class="error-text">Passwords do not match</span>
        }
      </div>
    }
  `,
  styles: [
    `
      .error-container {
        margin-top: 4px;
        display: block;
      }
      .error-text {
        color: #ff4d4d;
        font-size: 12px;
        display: block;
      }
    `,
  ],
})
export class FormErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;

  @Input() groupContext: AbstractControl | null = null;
}
