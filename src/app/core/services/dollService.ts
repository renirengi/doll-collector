import {
  Injectable,
  signal,
  inject,
  WritableSignal,
  Signal,
} from '@angular/core';
import { Doll, UserDoll } from '../../shared/models/doll.model';
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
  public readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public readonly totalCount: WritableSignal<number> = signal<number>(0);
  public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Current active filters. Defaults to first page with standard limit.
   * userFilters is optional in the interface, so no error here.
   */
  public readonly filters: WritableSignal<DollCatalogFilters> =
    signal<DollCatalogFilters>({
      _page: 1,
      _limit: 12,
    });

  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  constructor() {}

  /**
   * Fully replaces the filter state and triggers a reset load.
   * @param baseFilters - New filter configuration.
   */
  public async setRawFilters(baseFilters: DollCatalogFilters): Promise<void> {
    const updated = { ...baseFilters, _page: 1, _limit: 12 };
    this.filters.set(updated);
    return this.runLoadSequence(updated);
  }

  /**
   * Merges partial updates into the existing filter state.
   * Ensures nested userFilters are preserved or updated correctly.
   * @param newFilters - Partial filters to merge.
   */
  public updateFilters(newFilters: Partial<DollCatalogFilters>): void {
    const current = this.filters();
    const updated: DollCatalogFilters = {
      ...current,
      ...newFilters,
      _page: 1,
      userFilters: newFilters.userFilters || current.userFilters,
    };

    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Fetches the next page of results and appends them to the current list.
   */
  public loadMoreDolls(): void {
    if (this.isLoading() || !this.hasMore()) return;

    const updated = {
      ...this.filters(),
      _page: (this.filters()._page || 1) + 1,
    };
    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Internal execution logic for API requests.
   * Handles pagination, response mapping, and UI state synchronization.
   * @param currentFilters - The filters to be sent to the backend.
   */
  private async runLoadSequence(
    currentFilters: DollCatalogFilters,
  ): Promise<void> {
    // Priority check: reset (page 1) overrides current loading
    if (this.isLoading() && currentFilters._page !== 1) return;

    this.isLoading.set(true);

    try {
      // apiService.getAll must be updated to accept DollCatalogFilters
      const response = await this.apiService.getAll(currentFilters);

      const newDolls: Doll[] = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      const total: number =
        (response as any)?.total ?? (response as any)?.totalCount ?? 0;

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);
        const effectiveTotal = total > 0 ? total : newDolls.length;
        this.totalCount.set(effectiveTotal);
        this.uiState.totalDolls.set(effectiveTotal);
      } else {
        this.dollsSignal.update((old) => [...old, ...newDolls]);
      }

      const limit = currentFilters._limit || 12;
      const currentLoadedCount = this.dollsSignal().length;

      if (total > 0) {
        this.hasMore.set(currentLoadedCount < total);
      } else {
        this.hasMore.set(newDolls.length === limit && newDolls.length > 0);
      }
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
   * Enriches user-specific doll data with master record details from the catalog.
   * This prevents data duplication in the API by fetching catalog details by ID.
   *
   * @param userDolls - Array of user-owned doll records containing dollId references.
   * @returns A promise resolving to a collection of user dolls merged with their catalog information.
   */
  private async enrichUserDolls(userDolls: UserDoll[]): Promise<any[]> {
    const catalogIds = [
      ...new Set(userDolls.map((ud) => ud.dollId).filter(Boolean)),
    ];

    const catalogData = await Promise.all(
      catalogIds.map((id) => this.apiService.getById(id!)),
    );

    const catalogMap = new Map(catalogData.map((d) => [d.id, d]));

    return userDolls.map((ud) => ({
      ...ud,
      catalogInfo: catalogMap.get(ud.dollId!),
    }));
  }
}
