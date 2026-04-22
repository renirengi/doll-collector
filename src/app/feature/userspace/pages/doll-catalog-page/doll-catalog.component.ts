import {
  Component,
  inject,
  viewChild,
  ElementRef,
  computed,
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
  // Dependencies
  protected readonly ui = inject(UserspaceStateService);
  protected readonly service = inject(DollService);
  private readonly route = inject(ActivatedRoute);

  // Element Queries
  private readonly trigger = viewChild<ElementRef>('infiniteTrigger');

  /**
   * Syncs URL query parameters with the service state.
   * No manual subscribe/unsubscribe.
   */
  protected readonly params = toSignal(
    this.route.queryParams.pipe(tap((p: Params): void => this.syncFilters(p))),
  );

  /**
   * Computed state for infinite scroll activation.
   */
  protected readonly canLoadMore = computed(
    (): boolean => !this.service.isLoading() && this.service.hasMore(),
  );

  constructor() {
    createInfiniteScroll(this.trigger, {
      canLoad: this.canLoadMore,
      action: (): void => this.service.loadMoreDolls(),
    });
  }

  /**
   * Extracts and normalizes filters from the route.
   * Complexity: 3
   */
  private syncFilters(p: Params): void {
    const filters = {
      manufacturer: this.mapParam<Manufacturer>(p['manufacturer']),
      brand: this.mapParam<DollBrand>(p['brand']),
    };

    this.service.setRawFilters(filters);
  }

  /**
   * Ensures the parameter is always an array of strings.
   * Complexity: 2
   */
  private mapParam<T>(value: unknown): T[] | null {
    if (!value) return null;

    const array = Array.isArray(value) ? value : [String(value)];
    return array as T[];
  }
}
