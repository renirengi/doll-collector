import {
  Injectable,
  signal,
  inject,
  WritableSignal,
  Signal,
} from '@angular/core';
import { Doll, UserDoll, EnrichedUserDoll } from '../../shared/models/doll.model';
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

  /**
   * Current active filters. Defaults to first page with standard limit.
   */
  public readonly filters = signal<DollCatalogFilters>({
    _page: 1,
    _limit: 12,
  });

  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  /**
   * Fully replaces the filter state and triggers a reset load.
   * @param baseFilters - New filter configuration.
   */
  public async setRawFilters(baseFilters: DollCatalogFilters): Promise<void> {
    const updated: DollCatalogFilters = { ...baseFilters, _page: 1, _limit: 12 };
    this.filters.set(updated);
    return this.runLoadSequence(updated);
  }

  /**
   * Merges partial updates into the existing filter state.
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

    const updated: DollCatalogFilters = {
      ...this.filters(),
      _page: (this.filters()._page || 1) + 1,
    };
    this.filters.set(updated);
    this.runLoadSequence(updated);
  }

  /**
   * Internal execution logic for API requests.
   * Maps response from array to internal signals.
   * @param currentFilters - The filters to be sent to the backend.
   */
  private async runLoadSequence(
    currentFilters: DollCatalogFilters,
  ): Promise<void> {
    if (this.isLoading() && currentFilters._page !== 1) return;

    this.isLoading.set(true);

    try {
      const response: Doll[] = await this.apiService.getAll(currentFilters);

      if (currentFilters._page === 1) {
        this.dollsSignal.set(response);
        this.totalCount.set(response.length);
        this.uiState.totalDolls.set(response.length);
      } else {
        this.dollsSignal.update((old) => [...old, ...response]);
      }

      const limit = currentFilters._limit || 12;
      this.hasMore.set(response.length === limit);

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
   * Enriches user-specific doll data with master record details.
   * @param userDolls - Array of user-owned doll records.
   * @returns A promise resolving to enriched user dolls.
   */
  private async enrichUserDolls(userDolls: UserDoll[]): Promise<EnrichedUserDoll[]> {
    const catalogIds: string[] = [
      ...new Set(userDolls.map((ud) => ud.dollId).filter((id): id is string => !!id)),
    ];

    const catalogData: Doll[] = await Promise.all(
      catalogIds.map((id) => this.apiService.getById(id)),
    );

    const catalogMap = new Map<string, Doll>(
      catalogData.map((d) => [d.id, d])
    );

    return userDolls.map((ud) => ({
      ...ud,
      catalogInfo: ud.dollId ? catalogMap.get(ud.dollId) : undefined,
    } as EnrichedUserDoll));
  }
}
