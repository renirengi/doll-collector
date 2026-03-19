import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import {
  inject,
  Injectable,
  signal,
  WritableSignal,
  Signal,
  effect,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Doll } from '../../shared/models/doll.model';
import { DollFilters } from '../../shared/models/doll-filters.model';

@Injectable({
  providedIn: 'root',
})
export class DollService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/dolls';

  private readonly dollsSignal: WritableSignal<Doll[]> = signal<Doll[]>([]);

  public readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public readonly totalCount: WritableSignal<number> = signal<number>(0);
  public readonly hasMore: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Holds the current filter and pagination state.
   */
  public readonly filters: WritableSignal<DollFilters> = signal<DollFilters>({
    _page: 1,
    _limit: 10,
  });

  /**
   * Read-only signal providing the current list of dolls.
   */
  public readonly dolls: Signal<Doll[]> = this.dollsSignal.asReadonly();

  constructor() {
    /**
     * Reacts to any change in the filters signal and triggers data fetching.
     */
    effect(
      async () => {
        const currentFilters = this.filters();
        await this.loadDolls(currentFilters);
      },
      { allowSignalWrites: true },
    );
  }

  /**
   * Fetches dolls from the server based on the provided filters.
   * Handles HttpParams construction, including nested properties and arrays.
   * Manages data concatenation for infinite scrolling based on page index.
   * * @param currentFilters The filter object containing query parameters and pagination.
   * @returns A promise that resolves when the HTTP request and signal updates are finished.
   */
  private async loadDolls(currentFilters: DollFilters): Promise<void> {
    this.isLoading.set(true);
    let params: HttpParams = new HttpParams();

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      const paramKey =
        key === 'purchaseStates' ? 'purchaseCondition.state' : key;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          params = params.append(paramKey, item.toString());
        });
      } else if (key === 'sortData' && typeof value === 'object') {
        const sort = value as { field: string; order: string };
        params = params.set('_sort', sort.field).set('_order', sort.order);
      } else {
        params = params.set(paramKey, value.toString());
      }
    });

    try {
      const response: HttpResponse<Doll[]> = await firstValueFrom(
        this.http.get<Doll[]>(this.API_URL, { params, observe: 'response' }),
      );

      const newDolls: Doll[] = response.body || [];
      const total: number = Number(response.headers.get('X-Total-Count')) || 0;

      this.totalCount.set(total);

      if (currentFilters._page === 1) {
        this.dollsSignal.set(newDolls);
      } else {
        this.dollsSignal.update((oldDolls: Doll[]) => [
          ...oldDolls,
          ...newDolls,
        ]);
      }

      this.hasMore.set(this.dollsSignal().length < total);
    } catch (error) {
      console.error('Error loading dolls:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Updates specific filter fields and automatically resets pagination to the first page.
   * Used for UI-driven filtering (e.g., checkboxes, dropdowns).
   * * @param newFilters Partial filter object to be merged into the current state.
   */
  public updateFilters(newFilters: Partial<DollFilters>): void {
    this.filters.update((old: DollFilters) => ({
      ...old,
      ...newFilters,
      _page: 1,
    }));
  }

  /**
   * Replaces the entire filter state. Useful for switching contexts,
   * such as navigating between different manufacturers or brands.
   * * @param baseFilters The new full filter object.
   */
  public setRawFilters(baseFilters: DollFilters): void {
    this.filters.set({
      _page: 1,
      _limit: 10,
      ...baseFilters,
    });
  }

  /**
   * Increments the page number to fetch the next batch of data.
   * Prevents execution if a request is already in progress or if no more data is available.
   */
  public loadMoreDolls(): void {
    if (!this.isLoading() && this.hasMore()) {
      this.filters.update((old: DollFilters) => ({
        ...old,
        _page: (old._page || 1) + 1,
      }));
    }
  }

  /**
   * Manually sets the pagination to a specific page index.
   * * @param pageIndex The target page number.
   */
  public setPage(pageIndex: number): void {
    this.filters.update((old: DollFilters) => ({
      ...old,
      _page: pageIndex,
    }));
  }
}
