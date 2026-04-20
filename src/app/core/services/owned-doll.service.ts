import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from './message-service.service';
import { UserDoll, OwnedDollSortAndFilterDto } from '../../shared/models';
import { OwnedDollApiService } from '../../../api/services/owned-doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';

/**
 * Core business service for managing the "User Shelf" state.
 * Encapsulates reactive state management using Angular Signals.
 */
@Injectable({
  providedIn: 'root',
})
export class OwnedDollService {
  private readonly api = inject(OwnedDollApiService);
  private readonly messages = inject(MessageService);
  private readonly uiState = inject(UserspaceStateService);

  // --- State Signals ---
  public readonly dolls = signal<UserDoll[]>([]);
  public readonly totalCount = signal<number>(0);
  public readonly isLoading = signal<boolean>(false);
  public readonly currentPage = signal<number>(1);
  public readonly currentLimit = signal<number>(12);

  /**
   * Track current criteria to know which endpoint to hit during pagination.
   */
  public readonly currentCriteria = signal<OwnedDollSortAndFilterDto | null>(
    null,
  );

  /**
   * Orchestrates data loading with concurrency protection.
   */
  public async loadShelf(
    criteria: OwnedDollSortAndFilterDto | null = null,
    page: number = 1,
    limit: number = 12,
  ): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.currentCriteria.set(criteria);
    this.currentPage.set(page);

    try {
      const hasCriteria =
        criteria &&
        ((criteria.filterCriteria &&
          Object.keys(criteria.filterCriteria).length > 0) ||
          (criteria.sortCriteria &&
            Object.keys(criteria.sortCriteria).length > 0));

      const response = hasCriteria
        ? await firstValueFrom(this.api.sortAndFilter(criteria!, page, limit))
        : await firstValueFrom(this.api.findAll(page, limit));

      const serverTotal = response.total || 0;

      if (page === 1) {
        this.dolls.set(response.data || []);
      } else {
        this.dolls.update((prev) => [...prev, ...response.data]);
      }

      this.totalCount.set(serverTotal);
      this.uiState.totalDolls.set(serverTotal);
    } catch (error) {
      if (page === 1) {
        this.dolls.set([]);
        this.totalCount.set(0);
        this.uiState.totalDolls.set(0);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Removes a doll from the shelf and refreshes the list to ensure correct pagination.
   */
  public async deleteFromShelf(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.delete(id));
      this.messages.showSuccess('Doll removed from your collection.');
      await this.loadShelf(this.currentCriteria(), 1);
    } catch (error) {
      this.messages.showError('Failed to delete the doll.');
    }
  }

  /**
   * Updates specific details about an owned doll (notes, status, etc.)
   */
  public async updateDollDetails(
    id: string,
    data: Partial<UserDoll>,
  ): Promise<void> {
    try {
      const updated = await firstValueFrom(this.api.update(id, data));
      this.messages.showSuccess('Updated.');
      this.dolls.update((list) =>
        list.map((d) => (d.id === id ? { ...d, ...updated } : d)),
      );
    } catch (error) {
      this.messages.showError('Update failed.');
    }
  }

  /**
   * Resets the shelf state when component is destroyed or user logs out.
   */
  public clearShelfState(): void {
    this.dolls.set([]);
    this.totalCount.set(0);
    this.isLoading.set(false);
    this.currentPage.set(1);
    this.uiState.totalDolls.set(0);
    this.currentCriteria.set(null);
  }
}
