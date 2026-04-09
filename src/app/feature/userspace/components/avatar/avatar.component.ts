import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="size()"
      class="avatar-container relative group overflow-hidden rounded-full border border-white/20"
    >
      @if (src()) {
        <img
          [src]="src()"
          [alt]="name() || 'User Avatar'"
          class="avatar-img object-cover w-full h-full"
        />
      } @else if (initial()) {
        <div
          class="avatar-initial w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-[#c084fc] to-[var(--indigo-vibe)]"
        >
          <span class="text-sm font-bold tracking-tight">
            {{ initial() }}
          </span>
        </div>
      } @else {
        <div
          class="avatar-system w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-1/2 h-1/2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
      }
    </div>
  `,
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  public readonly src = input<string | null | undefined>(null);
  public readonly name = input<string | null | undefined>(null);
  public readonly size = input<string>('w-11 h-11');

  public readonly initial = computed<string | null>(() => {
    const nameValue = this.name()?.trim();
    if (!nameValue) return null;

    const vowels = /[aeiouyаеёиоуыэюя]/gi;

    const consonantsOnly = nameValue.replace(vowels, '').replace(/\s+/g, '');

    if (consonantsOnly.length === 0) {
      return nameValue.charAt(0).toUpperCase();
    }

    return consonantsOnly.substring(0, 2).toUpperCase();
  });
}
