import {
  Injectable,
  signal,
  WritableSignal,
  Signal,
  computed,
} from '@angular/core';
import { Doll } from '../../shared/models/doll.model';
import { DollFilters } from '../../shared/models/doll-filters.model';
import { DollApiService } from '../../../api/services/doll.api';

@Injectable({
  providedIn: 'root',
})
export class DollService {
  private readonly dollsSignal: WritableSignal<Doll[]> = signal<Doll[]>([]);
  public readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public readonly totalCount: WritableSignal<number> = signal<number>(0);
  public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);

  public readonly filters: WritableSignal<DollFilters> = signal<DollFilters>({
    _page: 1,
    _limit: 10,
  });

  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  constructor() {}

  /**
   * Initial data load.
   */
  public async init(): Promise<void> {
    return this.loadDolls(this.filters());
  }

  /**
   * Core method to fetch data.
   */
  private async loadDolls(currentFilters: DollFilters): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    try {
      const response = await DollApiService.getAll(currentFilters);
      const newDolls: Doll[] = Array.isArray(response) ? response : (response as any)?.data || [];
      const total: number = (response as any)?.total ?? (response as any)?.totalCount ?? newDolls.length;

      this.totalCount.set(total);

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);
      } else {
        this.dollsSignal.update((old) => [...old, ...newDolls]);
      }

      this.hasMore.set(this.dolls().length < total);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reset all filters to new values and reload from page 1.
   * @param baseFilters - New set of filters.
   */
  public setRawFilters(baseFilters: DollFilters): void {
    const updated = {
      _page: 1,
      _limit: 10,
      ...baseFilters,
    };
    this.filters.set(updated);
    this.loadDolls(updated);
  }

  /**
   * Update partial filters and reload.
   */
  public updateFilters(newFilters: Partial<DollFilters>): void {
    const updated = { ...this.filters(), ...newFilters, _page: 1 };
    this.filters.set(updated);
    this.loadDolls(updated);
  }

  /**
   * Next page load.
   */
  public loadMoreDolls(): void {
    if (!this.isLoading() && this.hasMore()) {
      const updated = { ...this.filters(), _page: (this.filters()._page || 1) + 1 };
      this.filters.set(updated);
      this.loadDolls(updated);
    }
  }
}
