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
    <nav class="manufacturer-nav">
      <div class="nav-scroll-container">
        <button mat-stroked-button
                routerLink="/catalog"
                routerLinkActive="active-link"
                [routerLinkActiveOptions]="{exact: true}">
          All
        </button>

        @for (m of manufacturers; track m) {
          <button mat-stroked-button
                  [routerLink]="['/catalog', m]"
                  routerLinkActive="active-link">
            {{ m }}
          </button>
        }
      </div>
    </nav>
  `,
  styleUrls: ['./manufacturer-navigation.component.scss']
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
    'GWToys',
    'Jakks Pacific',
    'Simba Toys',
    'Other'
  ];
}
