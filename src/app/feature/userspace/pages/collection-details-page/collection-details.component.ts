import { Component, inject, computed, input } from '@angular/core';
import { CollectionService } from '../../../../core/services/collection.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { MatIcon } from '@angular/material/icon';

/**
 * Component responsible for displaying dolls within a specific user collection.
 */
@Component({
  selector: 'app-collection-details',
  standalone: true,
  template: `
    @if (ui.isFilterOpen()) {
      <div class="filters-drawer-animation" @dropdown>
        <app-filter-panel />
      </div>
    }
    <div class="catalog-container custom min-h-screen">
      @if (collection(); as col) {
        <header class="catalog-header">
          <h1>{{ col.name }}</h1>
          <p>
            {{ col.description }}
          </p>
        </header>
      } @else {
        <p>Collection not found</p>
      }

      <main
        class="catalog-content"
        [class.is-loading]="collectionService.isLoading()"
      >
        @if (
          collectionService.isLoading() &&
          collectionService.dolls().length === 0
        ) {
          <div class="initial-spinner">
            <mat-progress-spinner mode="indeterminate" />
          </div>
        }

        <div class="doll-flex">
          @for (doll of collectionService.dolls(); track doll.id) {
            <app-doll-card [doll]="doll" />
          } @empty {
            @if (!collectionService.isLoading()) {
              <div class="empty-state">
                <mat-icon>search</mat-icon>
                <p>No dolls found matching these filters.</p>
              </div>
            }
          }
          <div #infiniteTrigger class="infinite-scroll-trigger">
            @if (collectionService.isLoading()) {
              <mat-progress-spinner mode="indeterminate" diameter="40" />
            }
          </div>
        </div>
      </main>
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

  /**
   * Automatically bound from the route parameter ':id'
   */
  public readonly id = input.required<string>();

  /**
   * Finds the current collection in the service state.
   * Re-evaluates automatically whenever 'id' or 'collections' change.
   */
  public readonly collection = computed(() =>
    this.collectionService.collections().find((c) => c.id === this.id()),
  );
}
