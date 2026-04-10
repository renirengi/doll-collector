import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import * as T from '../../../../shared/models/doll-enums';
import { ManufacturerDetailsComponent } from '../manufacturer-details/manufacturer-details.component';

@Component({
  selector: 'app-manufacturer-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    ManufacturerDetailsComponent,
  ],
  template: `
    <nav class="wrapper catalog-nav">
      <div class="nav-container">
        <button
          [routerLink]="[]"
          [queryParams]="{ manufacturer: null, brand: null }"
          class="nav-btn text-btn"
          [class.active]="selectedManufacturers().length === 0"
        >
          All
        </button>

        @for (m of manufacturers; track m) {
          <button
            [routerLink]="[]"
            [queryParams]="{ manufacturer: toggleSelection(m), brand: null }"
            queryParamsHandling="merge"
            class="nav-btn"
            [class.img-btn]="m !== 'Other'"
            [class.text-btn]="m === 'Other'"
            [class.active]="isSelected(m)"
          >
            @if (m !== 'Other') {
              <img
                [src]="
                  'assets/manufactures/' +
                  m.toLowerCase().replace(' ', '') +
                  '.png'
                "
                [alt]="m"
                class="nav-logo"
              />
            } @else {
              Other
            }
          </button>
        }
      </div>
      <app-manufacturer-details></app-manufacturer-details>
    </nav>
  `,
  styleUrls: ['./manufacturer-navigation.component.scss'],
})
export class ManufacturerNavigationComponent {
  private readonly route = inject(ActivatedRoute);
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

  protected selectedManufacturers = toSignal(
    this.route.queryParams.pipe(
      map((params) => {
        const val = params['manufacturer'];
        return Array.isArray(val) ? val : val ? [val] : [];
      }),
    ),
    { initialValue: [] as string[] },
  );

  isSelected(m: string): boolean {
    return this.selectedManufacturers().includes(m);
  }

  toggleSelection(m: string): string[] | null {
    const current = this.selectedManufacturers();
    const updated = current.includes(m)
      ? current.filter((item) => item !== m)
      : [...current, m];
    return updated.length ? updated : null;
  }
}
