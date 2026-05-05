import { Component, inject, computed, input } from '@angular/core';
import { CollectionService } from '../../../../core/services/collection.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { MatIcon } from '@angular/material/icon';
import { Collection } from '../../../../shared/models';
@Component({
  selector: 'app-collection-details',
  standalone: true,
  template: `
    @if (ui.isFilterOpen()) {
      <div class="filters-drawer-animation">
        <app-filter-panel />
      </div>
    }
    <div class="catalog-container custom min-h-screen">
      @if (collection(); as col) {
        <header class="catalog-header">
          <h1>{{ col.name }}</h1>
          <p>{{ col.description }}</p>
        </header>

        <main
          class="catalog-content"
          [class.is-loading]="collectionService.isLoading()"
        >
          @if (
            collectionService.isLoading() &&
            (!col.dolls || col.dolls.length === 0)
          ) {
            <div class="initial-spinner">
              <mat-progress-spinner mode="indeterminate" />
            </div>
          }

          <div class="doll-flex">
            @for (doll of col.dolls; track doll.id) {
              <app-doll-card [doll]="doll" />
            } @empty {
              @if (!collectionService.isLoading()) {
                <div class="empty-state">
                  <mat-icon>search</mat-icon>
                  <p>No dolls found in this collection.</p>
                </div>
              }
            }
          </div>
        </main>
      } @else {
        <div class="empty-state">
          <p>Collection not found</p>
        </div>
      }
    </div>
  `,
  styleUrl: './collection-details-page.scss',
  imports: [
    FilterPanelComponent,
    MatProgressSpinner,
    DollCardComponent,
    MatIcon,
  ],
})
export class CollectionDetailsComponent {
  protected readonly collectionService = inject(CollectionService);
  protected readonly ui = inject(UserspaceStateService);

  public readonly id = input.required<string>();

  public readonly collection = computed<Collection | undefined>(() =>
    this.collectionService
      .collections()
      .find((c: Collection) => c.id === this.id()),
  );
}
