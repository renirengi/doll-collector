import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
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
    <nav class="catalog-nav">
      <div class="nav-container">
        <button
          [routerLink]="[]"
          [queryParams]="{ manufacturer: null, brand: null }"
          queryParamsHandling="merge"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{
            matrixParams: 'ignored',
            queryParams: 'exact',
            paths: 'exact',
            fragment: 'ignored',
          }"
          class="nav-btn text-btn"
        >
          All
        </button>

        @for (m of manufacturers; track m) {
          @if (m !== 'Other') {
            <button
              [routerLink]="[]"
              [queryParams]="{ manufacturer: m, brand: null }"
              queryParamsHandling="merge"
              routerLinkActive="active"
              class="nav-btn img-btn"
            >
              <img
                [src]="
                  'assets/manufactures/' +
                  m.toLowerCase().replace(' ', '') +
                  '.png'
                "
                [alt]="m"
                class="nav-logo"
              />
            </button>
          } @else {
            <button
              [routerLink]="[]"
              [queryParams]="{ manufacturer: m, brand: null }"
              queryParamsHandling="merge"
              routerLinkActive="active"
              class="nav-btn text-btn"
            >
              Other
            </button>
          }
        }
      </div>

      <app-manufacturer-details></app-manufacturer-details>
    </nav>
  `,
  styleUrls: ['./manufacturer-navigation.component.scss'],
})
export class ManufacturerNavigationComponent {
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
