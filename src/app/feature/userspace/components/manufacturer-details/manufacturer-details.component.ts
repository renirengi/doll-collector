import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-manufacturer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (brands().length > 0) {
      <nav class="wrapper nav-container mt-[1rem]">
        @for (brand of brands(); track brand) {
          @if (brand !== 'Other') {
            <button
              [routerLink]="[]"
              [queryParams]="{ brand: brand }"
              queryParamsHandling="merge"
              [class.active]="activeBrand() === brand"
              class="nav-btn img-btn"
            >
              <img
                [src]="'assets/brands/' + brand + '.png'"
                [alt]="brand"
                class="nav-logo"
              />
            </button>
          }
        }
      </nav>
    }
  `,
  styleUrls: ['./manufacturer-details.component.scss'],
})
export class ManufacturerDetailsComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
  );

  public readonly manufacturerName = computed(() => {
    const urlTree = this.router.parseUrl(this.url() || '');
    return urlTree.queryParamMap.get('manufacturer');
  });

  public readonly activeBrand = computed(() => {
    const urlTree = this.router.parseUrl(this.url() || '');
    return urlTree.queryParamMap.get('brand');
  });

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

  public readonly brands = computed(() => {
    const name = this.manufacturerName();
    return name ? this.brandRegistry[name] || [] : [];
  });
}
