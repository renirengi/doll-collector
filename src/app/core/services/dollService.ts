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
   * @param baseFilters
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
   * @param newFilters
   */
  public updateFilters(newFilters: Partial<DollCatalogFilters>): void {
    const current = this.filters();
    const updated: DollCatalogFilters = {
      ...current,
      ...this.sanitizeFilters(newFilters),
      _page: 1,
    };

    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Loads the next set of dolls for infinite scrolling.
   */
  public loadMoreDolls(): void {
    if (this.isLoading() || !this.hasMore()) return;

    const updated: DollCatalogFilters = {
      ...this.filters(),
      _page: (this.filters()._page || 1) + 1,
    };
    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * @param filters
   */
  private sanitizeFilters(
    filters: Partial<DollCatalogFilters>,
  ): Partial<DollCatalogFilters> {
    const sanitized: Partial<DollCatalogFilters> = { ...filters };
    const arrayFields: (keyof DollCatalogFilters)[] = [
      'manufacturer',
      'brand',
      'articulation',
      'bodyVolume',
      'footType',
      'releaseYear',
      'gender',
    ];

    arrayFields.forEach((field) => {
      if (field in sanitized) {
        const value = sanitized[field];
        if (Array.isArray(value)) {
          const flatArray = (value as unknown[])
            .flat()
            .filter((v) => v !== null && v !== undefined && v !== '');

          if (flatArray.length > 0) {
            (sanitized[field] as unknown[]) = flatArray;
          } else {
            delete sanitized[field];
          }
        } else if (
          value === null ||
          value === undefined ||
          (value as unknown) === ''
        ) {
          delete sanitized[field];
        } else {
          (sanitized[field] as unknown[]) = [value];
        }
      }
    });

    return sanitized;
  }

  /**
   * @param currentFilters
   */
  private async runLoadSequence(
    currentFilters: DollCatalogFilters,
  ): Promise<void> {
    if (this.isLoading() && currentFilters._page !== 1) return;

    this.isLoading.set(true);

    try {
      const response: DollsResponseDTO =
        await this.apiService.getAll(currentFilters);
      const newDolls = response.data || [];
      const serverTotal = response.total || 0;

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);
      } else {
        this.dollsSignal.update((old) => [...old, ...newDolls]);
      }

      this.totalCount.set(serverTotal);
      this.uiState.totalDolls.set(serverTotal);

      const limit = currentFilters._limit || 12;
      this.hasMore.set(this.dollsSignal().length < serverTotal);
    } catch (error) {
      this.hasMore.set(false);
      if (currentFilters._page === 1) {
        this.dollsSignal.set([]);
        this.totalCount.set(0);
        this.uiState.totalDolls.set(0);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
