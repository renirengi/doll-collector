import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import * as T from '../../../shared/models/doll-enums';

@Component({
  selector: 'app-manufacturer-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  template: `
    <nav class="w-full my-8 bg-transparent">
      <div class="flex flex-wrap items-center gap-6 px-6">
        <button
          routerLink="/catalog"
          routerLinkActive="!bg-indigo-600 !text-white !border-none shadow-lg"
          [routerLinkActiveOptions]="{ exact: true }"
          class="!rounded-full px-7 py-3 border-2 border-indigo-600 text-indigo-600 text-[1rem] font-black transition-all hover:bg-indigo-50"
        >
          All
        </button>

        @for (m of manufacturers; track m) {
          @if (m !== 'Other') {
            <button
              [routerLink]="['/catalog', m]"
              routerLinkActive="!border-none !bg-white shadow-[0_20px_50px_rgba(79,70,229,0.9)] scale-110"
              class="!rounded-3xl p-3 border-1 border-transparent bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md"
            >
              <img
                [src]="
                  'assets/manufactures/' +
                  m.toLowerCase().replace(' ', '') +
                  '.png'
                "
                [alt]="m"
                class="h-[2.5rem] w-auto object-contain pointer-events-none"
              />
            </button>
          } @else {
            <button
              [routerLink]="['/catalog', m]"
              routerLinkActive="!bg-indigo-600 !text-white border-none shadow-lg"
              class="!rounded-full px-7 py-3 border-2 border-indigo-600 text-indigo-600 text-[1rem] font-black transition-all hover:bg-indigo-50"
            >
              Other
            </button>
          }
        }
      </div>
    </nav>
  `,
  styleUrls: ['./manufacturer-navigation.component.scss'],
})
export class ManufacturerNavigationComponent {
  /**
   * List of manufacturers based on the Manufacturer enum type.
   */
  public readonly manufacturers: T.Manufacturer[] = [
    'Mattel',
    'Kurhn',
    'MGA Entertainment',
    'WowWee',
    'Hasbro',
    'Disney',
    'Spin Master',
    'Jakks Pacific',
    'Simba Toys',
    'Other',
  ];
}
