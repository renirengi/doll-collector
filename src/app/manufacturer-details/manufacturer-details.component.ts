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
    MatIconModule
],
  template: `
    <div class="manufacturer-page">
      <header class="page-header">
        <button mat-button routerLink="/catalog">
          <mat-icon>arrow_back</mat-icon> Back to Catalog
        </button>
        <h1>{{ manufacturerName() }} Collection</h1>
      </header>

      <nav class="brands-bar">
        @for (brand of brands(); track brand) {
          <button mat-stroked-button
                  [routerLink]="['/catalog', manufacturerName(), brand]"
                  routerLinkActive="active-brand">
            {{ brand }}
          </button>
        }
      </nav>

      <app-doll-filters></app-doll-filters>

      <main class="doll-grid">
        @for (doll of service.dolls(); track doll.id) {
          <app-doll-card [doll]="doll"></app-doll-card>
        }
      </main>
    </div>
  `,
  styleUrls: ['./manufacturer-details.component.scss']
})
export class ManufacturerDetailsComponent {
  public readonly service = inject(DollService);
  private readonly route = inject(ActivatedRoute);

  public readonly manufacturerName = computed(() => this.route.snapshot.params['manufacturer']);

  private readonly brandRegistry: Record<string, string[]> = {
    'Mattel': ['Barbie', 'Monster High'],
    'Simba Toys': ['Steffi Love'],
    'Kurhn': ['Kurhn', 'Sonya Rose'],
    'MGA Entertainment': ['Bratz', 'Rainbow High','Lol OMG' ],
    'WowWee':['Once Upon a Zombie'],
    'Spin Master':['Disney ILY 4ever', 'Liv'],
    'Jakks Pacific':['Disney ILY 4ever'],
    'GWToys':['Sandra'],
    'Other':['Other']
  };

  public readonly brands = computed(() => {
    const name = this.manufacturerName();
    return name ? this.brandRegistry[name] || [] : [];
  });
}
