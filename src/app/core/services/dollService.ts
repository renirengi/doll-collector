import {
  Injectable,
  signal,
  inject,
  WritableSignal,
  Signal,
} from '@angular/core';
import {
  Doll,
  UserDoll,
  EnrichedUserDoll,
  DollsResponseDTO,
} from '../../shared/models/doll.model';
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
   * Updates the filter state with a complete set of criteria and initiates a new fetch from the first page.
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
   * Merges partial updates into the current filter state, ensuring data normalization before reloading.
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
   * Triggers loading of the next page of results, appending them to the existing doll collection.
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
   * Validates and cleanses filter values. Flattens nested arrays and removes invalid entries.
   * Uses type-safe checks to satisfy strict TypeScript configurations without using 'any'.
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
   * Orchestrates the API request cycle and updates state signals based on the response.
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

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);

        // Так как поля total нет, используем длину массива для счетчиков
        this.totalCount.set(newDolls.length);
        this.uiState.totalDolls.set(newDolls.length);
      } else {
        this.dollsSignal.update((old) => [...old, ...newDolls]);

        const currentTotal = this.totalCount() + newDolls.length;
        this.totalCount.set(currentTotal);
        this.uiState.totalDolls.set(currentTotal);
      }

      const limit = currentFilters._limit || 12;

      this.hasMore.set(newDolls.length === limit);
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

  /**
   * Enriches collection data by mapping user records to full catalog definitions.
   */
  private async enrichUserDolls(
    userDolls: UserDoll[],
  ): Promise<EnrichedUserDoll[]> {
    const catalogIds: string[] = [
      ...new Set(
        userDolls.map((ud) => ud.dollId).filter((id): id is string => !!id),
      ),
    ];

    const catalogData: Doll[] = await Promise.all(
      catalogIds.map((id) => this.apiService.getById(id)),
    );

    const catalogMap = new Map<string, Doll>(catalogData.map((d) => [d.id, d]));

    return userDolls.map(
      (ud) =>
        ({
          ...ud,
          catalogInfo: ud.dollId ? catalogMap.get(ud.dollId) : undefined,
        }) as EnrichedUserDoll,
    );
  }
}
