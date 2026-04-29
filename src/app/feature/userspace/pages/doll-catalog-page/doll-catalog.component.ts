import {
  Component,
  inject,
  viewChild,
  ElementRef,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { DollService } from '../../../../core/services/dollService';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { dropdownAnimation } from '../../../../shared/animations';
import { createInfiniteScroll } from '../../../../shared/utils';
import { DollBrand, Manufacturer } from '../../../../shared/models';
import { DollCatalogFilters } from '../../../../shared/models/doll-filters.model';

@Component({
  selector: 'app-doll-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DollCardComponent,
    FilterPanelComponent,
  ],
  templateUrl: './doll-catalog.component.html',
  styleUrls: ['./doll-catalog.component.scss'],
  animations: [dropdownAnimation],
})
export class DollCatalogComponent {
  protected readonly ui = inject(UserspaceStateService);
  protected readonly service = inject(DollService);
  private readonly route = inject(ActivatedRoute);

  private readonly trigger = viewChild<ElementRef>('infiniteTrigger');

  /**
   * Reactive signal tracking URL parameters and triggering filter synchronization.
   */
  protected readonly params: Signal<Params | undefined> = toSignal(
    this.route.queryParams.pipe(tap((p: Params): void => this.syncFilters(p))),
  );

  /**
   * Determines if the infinite scroll can trigger a new load.
   */
  protected readonly canLoadMore: Signal<boolean> = computed(
    (): boolean => !this.service.isLoading() && this.service.hasMore(),
  );

  constructor() {
    createInfiniteScroll(this.trigger, {
      canLoad: this.canLoadMore,
      action: (): void => this.service.loadMoreDolls(),
    });
  }

  /**
   * Syncs URL parameters with DollService state including filters and sorting.
   * @param p The query parameters from ActivatedRoute.
   */
  private syncFilters(p: Params): void {
    const filters: Partial<DollCatalogFilters> = {
      manufacturer: this.mapParam<Manufacturer>(p['manufacturer']),
      brand: this.mapParam<DollBrand>(p['brand']),
      _sort: this.mapSortField(p['_sort']),
      _order: this.mapSortOrder(p['_order']),
    };

    this.service.updateFilters(filters);
  }

  /**
   * Normalizes query parameter values into a typed array.
   * @param value The raw parameter value.
   * @returns An array of type T or null if empty.
   */
  private mapParam<T>(value: unknown): T[] | null {
    if (!value) {
      return null;
    }

    const array: string[] = Array.isArray(value) ? value : [String(value)];
    return array as T[];
  }

  /**
   * Validates and maps the sort field from a raw string.
   * @param field Raw value from query params.
   */
  private mapSortField(field: unknown): DollCatalogFilters['_sort'] {
    const validFields: DollCatalogFilters['_sort'][] = [
      'releaseYear',
      'soldPrice',
      'acquisitionYear',
      'createdAt',
    ];

    return validFields.includes(field as DollCatalogFilters['_sort'])
      ? (field as DollCatalogFilters['_sort'])
      : undefined;
  }

  /**
   * Validates and maps the sort order from a raw string.
   * @param order Raw value from query params.
   */
  private mapSortOrder(order: unknown): DollCatalogFilters['_order'] {
    const upperOrder = String(order).toUpperCase();
    return upperOrder === 'ASC' || upperOrder === 'DESC'
      ? upperOrder
      : undefined;
  }
}
