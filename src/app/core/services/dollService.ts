import {
  Injectable,
  signal,
  inject,
  WritableSignal,
  Signal,
} from '@angular/core';
import { Doll, DollsResponseDTO } from '../../shared/models/doll.model';
import { DollCatalogFilters } from '../../shared/models/doll-filters.model';
import { DollApiService } from '../../../api/services/doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';

@Injectable({
  providedIn: 'root',
})
export class DollService {
  private readonly apiService = inject(DollApiService);
  private readonly uiState = inject(UserspaceStateService);

  private readonly dollsSignal: WritableSignal<Doll[]> = signal<Doll[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly totalCount = signal<number>(0);
  public readonly hasMore = signal<boolean>(false);
  public readonly filters = signal<DollCatalogFilters>({
    _page: 1,
    _limit: 12,
  });

  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  /**
   * Resets filters and starts a new load sequence from the first page.
   * @param baseFilters The new filter set to apply.
   */
  public async setRawFilters(baseFilters: DollCatalogFilters): Promise<void> {
    const updated: DollCatalogFilters = {
      ...this.sanitizeFilters(baseFilters),
      _page: 1,
      _limit: 12,
    };
    this.filters.set(updated);
    return this.runLoadSequence(updated);
  }

  /**
   * Merges new filters with current state and reloads from page 1.
   * @param newFilters Partial filters to merge.
   */
  public updateFilters(newFilters: Partial<DollCatalogFilters>): void {
    const updated: DollCatalogFilters = {
      ...this.filters(),
      ...this.sanitizeFilters(newFilters),
      _page: 1,
    };

    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Increments page and appends new dolls to the list.
   * Method for infinite scroll support.
   */
  public loadMoreDolls(): void {
    if (this.isLoading() || !this.hasMore()) {
      return;
    }

    const updated: DollCatalogFilters = {
      ...this.filters(),
      _page: (this.filters()._page || 1) + 1,
    };

    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Removes empty, null or undefined values from filters.
   * @param filters Filters to clean.
   * @returns Sanitized filter object.
   */
  private sanitizeFilters(
    filters: Partial<DollCatalogFilters>,
  ): Partial<DollCatalogFilters> {
    const sanitized = { ...filters };
    const keys = Object.keys(sanitized) as (keyof DollCatalogFilters)[];

    keys.forEach((key) => {
      const value = sanitized[key];
      if (this.isEmpty(value)) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  /**
   * Checks if a filter value is considered empty.
   * @param value The value to check.
   */
  private isEmpty(value: unknown): boolean {
    if (Array.isArray(value)) {
      return value.flat().length === 0;
    }
    return value === null || value === undefined || value === '';
  }

  /**
   * Core sequence to fetch data and update signals.
   * @param currentFilters Active filters for the request.
   */
  private async runLoadSequence(
    currentFilters: DollCatalogFilters,
  ): Promise<void> {
    if (this.isLoading() && currentFilters._page !== 1) {
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await this.apiService.getAll(currentFilters);
      this.handleResponse(response, currentFilters._page || 1);
    } catch (error: unknown) {
      this.handleError(currentFilters._page === 1);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Processes API response and updates internal state.
   */
  private handleResponse(response: DollsResponseDTO, page: number): void {
    const newDolls = response.data || [];
    const total = response.total || 0;

    if (page === 1) {
      this.dollsSignal.set(newDolls);
    } else {
      this.dollsSignal.update((old) => [...old, ...newDolls]);
    }

    this.totalCount.set(total);
    this.uiState.totalDolls.set(total);
    this.hasMore.set(this.dollsSignal().length < total);
  }

  /**
   * Handles request failure by resetting or stopping pagination.
   */
  private handleError(isFirstPage: boolean): void {
    this.hasMore.set(false);
    if (isFirstPage) {
      this.dollsSignal.set([]);
      this.totalCount.set(0);
      this.uiState.totalDolls.set(0);
    }
  }
}
