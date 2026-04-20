import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { MessageService } from './message-service.service';
import { UserDoll, OwnedDollSortAndFilterDto } from '../../shared/models';
import { OwnedDollApiService } from '../../../api/services/owned-doll.api';

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

  // --- State Signals ---
  public readonly dolls = signal<UserDoll[]>([]);
  public readonly totalCount = signal<number>(0);
  public readonly isLoading = signal<boolean>(false);
  public readonly currentPage = signal<number>(1);
  public readonly currentLimit = signal<number>(12);

  public readonly currentCriteria = signal<OwnedDollSortAndFilterDto>({
    filterCriteria: {},
    sortCriteria: { ownedDollSortBy: 'createdAt', ownedDollSortOrder: 'DESC' },
  });

  /**
   * Primary method to load the shelf data with current filters and sorting.
   * Updates state signals automatically.
   */
  public loadShelf(
    criteria: OwnedDollSortAndFilterDto,
    page: number = 1,
    limit: number = 12,
  ): void {
    this.isLoading.set(true);
    this.currentCriteria.set(criteria);
    this.currentPage.set(page);

    this.api
      .sortAndFilter(criteria, page, limit)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (page === 1) {
            this.dolls.set(response.data);
          } else {
            this.dolls.update((prev) => [...prev, ...response.data]);
          }
          this.totalCount.set(response.total);
        },
        error: () => {
          this.messages.showError('Could not refresh your shelf.');
          if (page === 1) {
            this.dolls.set([]);
            this.totalCount.set(0);
          }
        },
      });
  }

  /**
   * Removes a doll from the shelf and refreshes the list to ensure correct pagination.
   */
  public deleteFromShelf(
    id: string,
    lastUsedCriteria: OwnedDollSortAndFilterDto,
  ): void {
    this.api.delete(id).subscribe({
      next: () => {
        this.messages.showSuccess('Doll removed from your collection.');
        this.loadShelf(
          lastUsedCriteria,
          this.currentPage(),
          this.currentLimit(),
        );
      },
      error: () => this.messages.showError('Failed to delete the doll.'),
    });
  }

  /**
   * Updates specific details about an owned doll (notes, status, etc.)
   */
  public updateDollDetails(id: string, data: Partial<UserDoll>): void {
    this.api.update(id, data).subscribe({
      next: (updated) => {
        this.messages.showSuccess('Doll details updated.');
        // Update local state signal for immediate UI feedback
        this.dolls.update((list) =>
          list.map((d) => (d.id === id ? { ...d, ...updated } : d)),
        );
      },
      error: () => this.messages.showError('Update failed.'),
    });
  }

  /**
   * Resets the shelf state when component is destroyed or user logs out.
   */
  public clearShelfState(): void {
    this.dolls.set([]);
    this.totalCount.set(0);
    this.isLoading.set(false);
    this.currentPage.set(1);
  }
}
