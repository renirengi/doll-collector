import { Injectable, inject, signal } from '@angular/core';
import { DollApiService } from '../../../../api/services/doll.api';
import { Doll } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AdminDollService {
  private readonly apiService = inject(DollApiService);

  public readonly dolls = signal<Doll[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly totalCount = signal<number>(0);
  public readonly filters = signal({ _page: 1, _limit: 15 });
  public readonly hasNextPage = signal<boolean>(false);

  /**
   * Fetches dolls with server-side pagination.
   */
  // admin-doll.service.ts

  public async loadPage(page: number, limit: number = 15): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await this.apiService.getAll({
        _page: page,
        _limit: limit,
        userFilters: {},
      });

      this.dolls.set(response);
      this.filters.set({ _page: page, _limit: limit });

      /**
       * Corrected mockTotal logic:
       * If the current page is full (length === limit), assume there might be more.
       * If not full, we know the exact count: (previous pages) + current items.
       */
      const mockTotal =
        response.length === limit
          ? page * limit + 1
          : (page - 1) * limit + response.length;

      this.totalCount.set(mockTotal);
      this.hasNextPage.set(response.length === limit);
    } catch (error) {
      console.error('Load failed:', error);
      this.dolls.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Creates a new doll record via POST /dolls.
   */
  public async createDoll(dollData: Partial<Doll>): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.apiService.create(dollData);
      // After creating, we return to the first page to see the new entry
      await this.loadPage(1, this.filters()._limit);
    } catch (error) {
      console.error('Create failed:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Permanently deletes a doll by ID.
   */
  public async deleteDoll(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.apiService.delete(id);

      const { _page, _limit } = this.filters();
      const currentList = this.dolls();

      const targetPage =
        currentList.length === 1 && _page > 1 ? _page - 1 : _page;

      await this.loadPage(targetPage, _limit);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
