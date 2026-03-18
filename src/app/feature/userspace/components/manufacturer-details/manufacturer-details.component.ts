import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manufacturer-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (brands().length > 0) {
      <nav class="nav-container mt-[2rem]">
        @for (brand of brands(); track brand) {
          <button
            [routerLink]="['/catalog', manufacturerName(), brand]"
            [class.active]="activeBrand() === brand"
            class="nav-btn"
            [class.img-btn]="brand !== 'Other'"
            [class.text-btn]="brand === 'Other'"
          >
            @if (brand !== 'Other') {
              <img
                [src]="'assets/brands/' + brand + '.png'"
                [alt]="brand"
                class="nav-logo"
              />
            } @else {
              <span>Other</span>
            }
          </button>
        }
      </nav>
    }
  `,
  styleUrls: ['./manufacturer-details.component.scss'],
})
export class ManufacturerDetailsComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.params);

  public readonly manufacturerName = computed(
    () => this.params()?.['manufacturer'],
  );

  public readonly activeBrand = computed(() => this.params()?.['brand']);

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
