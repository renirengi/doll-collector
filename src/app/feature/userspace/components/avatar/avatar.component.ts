import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/**
 * AvatarComponent displays a user's image, initials, or a fallback icon.
 * Now using Signal Inputs for better performance and reactivity.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="size()" class="avatar-container relative group">
      @if (src()) {
        <img [src]="src()" [alt]="name() || 'User Avatar'" class="avatar-img" />
      } @else if (initial()) {
        <div class="avatar-initial">
          <span class="text-xl font-bold">
            {{ initial() }}
          </span>
        </div>
      } @else {
        <div class="avatar-system flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      }

      <div
        class="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="white"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      </div>
    </div>
  `,
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  /**
   * Image source URL.
   */
  public readonly src = input<string | null | undefined>(null);

  /**
   * User display name to derive initials.
   */
  public readonly name = input<string | null | undefined>(null);

  /**
   * CSS classes for container sizing.
   */
  public readonly size = input<string>('w-12 h-12');

  /**
   * Derived signal that provides the first letter of the name.
   * Automatically re-computes when 'name' input changes.
   */
  public readonly initial = computed<string | null>(() => {
    const nameValue = this.name();
    if (!nameValue || nameValue.trim().length === 0) return null;
    return nameValue.trim().charAt(0).toUpperCase();
  });
}
