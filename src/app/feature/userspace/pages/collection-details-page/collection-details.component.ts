import { Component, inject, computed, input } from '@angular/core';
import { CollectionService } from '../../../../core/services/collection.service';

/**
 * Component responsible for displaying dolls within a specific user collection.
 */
@Component({
  selector: 'app-collection-details',
  standalone: true,
  template: `
    <div class="collection-header">
      @if (collection(); as col) {
        <h1>{{ col.name }}</h1>
        <p>{{ col.description }}</p>
        <span class="icon" [class]="col.icon"></span>
      } @else {
        <p>Collection not found</p>
      }
    </div>

    <div class="dolls-grid">
      @for (doll of collection()?.dolls; track doll.id) {
        <div class="doll-card">{{ doll.originalName }}</div>
      } @empty {
        <p>This collection is empty. Add some dolls!</p>
      }
    </div>
  `,
  styles: [
    `
      .collection-header {
        padding: 2rem;
        border-bottom: 1px solid var(--lace-trim);
      }
      .dolls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        padding: 2rem;
      }
    `,
  ],
})
export class CollectionDetailsComponent {
  private readonly collectionService = inject(CollectionService);

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
