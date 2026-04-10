import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-manufacturer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (availableBrands().length > 0) {
      <nav class="wrapper nav-container mt-[1rem]">
        @for (brand of availableBrands(); track brand) {
          <button
            [routerLink]="[]"
            [queryParams]="{ brand: toggleBrand(brand) }"
            queryParamsHandling="merge"
            class="nav-btn img-btn"
            [class.active]="isBrandSelected(brand)"
          >
            <img
              [src]="'assets/brands/' + brand + '.png'"
              [alt]="brand"
              class="nav-logo"
            />
          </button>
        }
      </nav>
    }
  `,
  styleUrls: ['./manufacturer-details.component.scss'],
})
export class ManufacturerDetailsComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly selectedManufacturers = toSignal(
    this.route.queryParams.pipe(
      map((params) => {
        const val = params['manufacturer'];
        return Array.isArray(val) ? val : val ? [val] : [];
      }),
    ),
    { initialValue: [] as string[] },
  );

  private readonly selectedBrands = toSignal(
    this.route.queryParams.pipe(
      map((params) => {
        const val = params['brand'];
        return Array.isArray(val) ? val : val ? [val] : [];
      }),
    ),
    { initialValue: [] as string[] },
  );

  private readonly brandRegistry: Record<string, string[]> = {
    Mattel: ['Barbie', 'Monster High'],
    'Simba Toys': ['Steffi Love'],
    Kurhn: ['Kurhn', 'Sonya Rose'],
    'MGA Entertainment': [
      'Bratz',
      'Rainbow High',
      'Shadow High',
      'L.O.L. Surprise! O.M.G.',
    ],
    WowWee: ['Once Upon a Zombie'],
    'Spin Master': ['Disney ILY 4ever', 'Liv'],
    'Jakks Pacific': ['Disney ILY 4ever'],
    Other: ['Other', 'Sandra'],
  };

  public readonly availableBrands = computed(() => {
    const mans = this.selectedManufacturers();
    if (mans.length === 0) return [];
    const allBrands = mans.flatMap((m) => this.brandRegistry[m] || []);
    return [...new Set(allBrands)];
  });

  isBrandSelected(brand: string): boolean {
    return this.selectedBrands().includes(brand);
  }

  toggleBrand(brand: string): string[] | null {
    const current = this.selectedBrands();
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    return updated.length ? updated : null;
  }
}
