import { Component, inject, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DollFiltersComponent } from '../feature/userspace/doll-filters/doll-filters.component';
import { DollCardComponent } from '../feature/userspace/doll-card/doll-card.component';
import { DollService } from '../core/services/dollService';

@Component({
  selector: 'app-manufacturer-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DollFiltersComponent,
    DollCardComponent,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="min-h-screen p-4 md:p-8">
      <header class="mb-8">
        <button mat-button routerLink="/catalog" class="mb-4 !text-indigo-600">
          <mat-icon>arrow_back</mat-icon> Back to Catalog
        </button>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ manufacturerName() }}
          <span class="text-indigo-600">Collection</span>
        </h1>
      </header>

      <nav class="flex flex-wrap gap-2 mb-10 w-full justify-start">
        @for (brand of brands(); track brand) {
          <button
            mat-stroked-button
            [routerLink]="['/catalog', manufacturerName(), brand]"
            routerLinkActive="active-brand"
            class="brand-chip transition-all"
          >
            {{ brand }}
          </button>
        }
      </nav>

      <div class="mb-10 p-6 rounded-2xl shadow-sm border border-slate-200">
        <app-doll-filters></app-doll-filters>
      </div>

      <main
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        @for (doll of service.dolls(); track doll.id) {
          <app-doll-card
            [doll]="doll"
            class="transform hover:-translate-y-1 transition-transform duration-300"
          ></app-doll-card>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .no-scrollbar {
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none; /* Firefox */
        -webkit-overflow-scrolling: touch;
      }

      .no-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
      }

      .brand-chip {
        height: 40px !important;
        line-height: 40px !important;
        padding: 0 20px !important;
        border-radius: 9999px !important;
        border: 2px solid #374151 !important;
        color: #374151 !important;
        font-weight: 600 !important;
        background-color: transparent !important;

        ::ng-deep .mat-mdc-button-touch-target {
          display: none;
        }
      }

      .active-brand {
        background-color: #4f46e5 !important; // Indigo-600
        color: white !important;
        border-color: #4f46e5 !important;
      }

      :host ::ng-deep .mat-mdc-stroked-button {
        text-decoration: none;
      }
    `,
  ],
})
export class ManufacturerDetailsComponent {
  public readonly service = inject(DollService);
  private readonly route = inject(ActivatedRoute);

  public readonly manufacturerName = computed(
    () => this.route.snapshot.params['manufacturer'],
  );

  private readonly brandRegistry: Record<string, string[]> = {
    Mattel: ['Barbie', 'Monster High'],
    'Simba Toys': ['Steffi Love'],
    Kurhn: ['Kurhn', 'Sonya Rose'],
    'MGA Entertainment': ['Bratz', 'Rainbow High', 'Lol OMG'],
    WowWee: ['Once Upon a Zombie'],
    'Spin Master': ['Disney ILY 4ever', 'Liv'],
    'Jakks Pacific': ['Disney ILY 4ever'],
    Other: ['Other', 'Sandra'],
  };

  public readonly brands = computed(() => {
    const name = this.manufacturerName();
    return name ? this.brandRegistry[name] || [] : [];
  });
}
