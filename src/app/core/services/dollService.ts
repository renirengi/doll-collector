import {
  Injectable,
  signal,
  WritableSignal,
  Signal,
  inject,
} from '@angular/core';
import { Doll } from '../../shared/models/doll.model';
import { DollFilters } from '../../shared/models/doll-filters.model';
import { DollApiService } from '../../../api/services/doll.api';

@Injectable({
  providedIn: 'root',
})
export class DollService {
  private readonly apiService = inject(DollApiService);

  private readonly dollsSignal: WritableSignal<Doll[]> = signal<Doll[]>([]);
  public readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public readonly totalCount: WritableSignal<number> = signal<number>(0);
  public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Internal key to track the last successful or pending request filters.
   * Prevents duplicate API calls and infinite loops when dealing with cached 304 responses.
   */
  private lastRequestKey: string = '';

  /**
   * Current catalog filters state.
   */
  public readonly filters: WritableSignal<DollFilters> = signal<DollFilters>({
    _page: 1,
    _limit: 12,
  });

  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  /**
   * Resets the catalog to the first page with new filters.
   * @param baseFilters - Filter parameters from the URL or filter panel.
   */
  public async setRawFilters(baseFilters: DollFilters): Promise<void> {
    const updated = { ...baseFilters, _page: 1, _limit: 12 };
    this.filters.set(updated);
    return this.loadDolls(updated);
  }

  /**
   * Updates partial filters and reloads the catalog from the first page.
   * @param newFilters - Changes to apply to current filters.
   */
  public updateFilters(newFilters: Partial<DollFilters>): void {
    const updated = { ...this.filters(), ...newFilters, _page: 1 };
    this.filters.set(updated);
    this.loadDolls(updated);
  }

  /**
   * Fetches the next page of dolls for infinite scrolling.
   */
  public loadMoreDolls(): void {
    if (this.isLoading() || !this.hasMore()) return;

    const updated = {
      ...this.filters(),
      _page: (this.filters()._page || 1) + 1,
    };
    this.filters.set(updated);
    this.loadDolls(updated);
  }

  /**
   * Core data fetching logic with duplicate request prevention and loading state management.
   * @param currentFilters - Filters used for the specific API call.
   */
  private async loadDolls(currentFilters: DollFilters): Promise<void> {
    const requestKey = JSON.stringify(currentFilters);

    /**
     * Guard: Prevent redundant calls if identical request is pending or was just loaded.
     */
    if (this.isLoading() || this.lastRequestKey === requestKey) {
      return;
    }

    this.isLoading.set(true);
    this.lastRequestKey = requestKey;

    try {
      const response = await this.apiService.getAll(currentFilters);

      const newDolls: Doll[] = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      const total: number =
        (response as any)?.total ?? (response as any)?.totalCount ?? 0;

      this.totalCount.set(total);

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);
      } else {
        this.dollsSignal.update((old) => [...old, ...newDolls]);
      }

      this.hasMore.set(this.dolls().length < total);
    } catch (error) {
      this.lastRequestKey = ''; // Allow retry on failure
      console.error('API Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
