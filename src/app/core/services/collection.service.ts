import { inject, Injectable, signal, computed } from '@angular/core';
import { CollectionApiService } from '../../../api/services/collection.api';
import {
  Collection,
  CreateCollectionResponseDto,
  CollectionsResponseDTO,
} from '../../shared/models/collection.model';
import { firstValueFrom } from 'rxjs';
import { DollDataType, SidebarItem, UserDoll } from '../../shared/models';
import { IconUtils } from '../../shared/utils';
import { MessageService } from './message-service.service';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';

/**
 * Core service managing collection state and business logic using Signals.
 */
@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly api = inject(CollectionApiService);
  private readonly messages = inject(MessageService);
  private readonly uiState = inject(UserspaceStateService);

  // State signals for dolls and pagination
  public readonly dolls = signal<UserDoll[]>([]);
  public readonly totalCount = signal<number>(0);
  public readonly isLoading = signal<boolean>(false);
  public readonly currentPage = signal<number>(1);
  public readonly currentLimit = signal<number>(12);

  /**
   * Internal state holding the list of user collections.
   */
  private readonly _collections = signal<Collection[]>([]);

  /**
   * Exposed read-only signal of collections.
   */
  public readonly collections = this._collections.asReadonly();

  public readonly menuItems = computed<SidebarItem[]>(() =>
    this.collections()
      .filter((col) => IconUtils.isCustom(col.name))
      .map((col) => ({
        route: `/user/collections/${col.id}`,
        id: col.id,
        label: col.name,
        icon: col.icon,
        iconClass: IconUtils.getClassName(col.icon),
      })),
  );

  /**
   * Computed signal for the total number of collections.
   */
  public readonly count = computed(() => this._collections().length);

  constructor() {
    this.loadCollections();
  }

  /**
   * Fetches collections from the API and updates the state.
   */
  public async loadCollections(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response: CollectionsResponseDTO = await firstValueFrom(
        this.api.getAll(),
      );
      this._collections.set(response.data);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Orchestrates the creation of a new collection and updates the local state.
   */
  public async createCollection(
    dto: CreateCollectionResponseDto,
  ): Promise<Collection> {
    this.isLoading.set(true);
    try {
      const newCol = await firstValueFrom(this.api.create(dto));
      this._collections.update((prev) => [...prev, newCol]);
      return newCol;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Removes a collection and updates the state.
   */
  public async deleteCollection(id: string): Promise<void> {
    this.isLoading.set(true);
    try {
      await firstValueFrom(this.api.delete(id));
      this._collections.update((prev) => prev.filter((c) => c.id !== id));
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Checks if the given doll object is a UserDoll by verifying the existence of the 'base' property.
   * This ensures type safety when handling mixed DollDataType arrays.
   */
  private isUserDoll(doll: DollDataType): doll is UserDoll {
    return (doll as UserDoll).base !== undefined;
  }

  /**
   * Loads and paginates dolls belonging to a specific collection.
   * Supports mixed arrays of Doll and UserDoll by wrapping base Dolls into the UserDoll structure.
   *
   * @param id - The unique identifier of the collection.
   * @param page - The current page number for infinite scroll.
   */
  public async loadCollectionDolls(
    id: string,
    page: number = 1,
  ): Promise<void> {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.currentPage.set(page);

    try {
      const targetCollection = this._collections().find((c) => c.id === id);

      if (targetCollection) {
        const allItems: DollDataType[] = targetCollection.dolls || [];
        this.totalCount.set(allItems.length);

        const limit = this.currentLimit();
        const start = (page - 1) * limit;
        const end = start + limit;

        const pagedData = allItems.slice(start, end).map((item): UserDoll => {
          // If it's already a UserDoll, return as is to preserve personal metadata
          if (this.isUserDoll(item)) {
            return item;
          }

          // Transform base Doll into UserDoll structure with default enum values
          return {
            id: item.id,
            base: item,
            status: 'active', // Default DollStatus
            purchaseState: 'New', // Default DollState
            outfitState: 'original', // Default OutfitState
            pets: item.pets || [],
            defects: [],
            notes: [],
            familyNames: [],
            collectionIds: [id],
          };
        });

        // Update the signal state: replace on first page, append on subsequent pages
        if (page === 1) {
          this.dolls.set(pagedData);
        } else {
          this.dolls.update((prev) => [...prev, ...pagedData]);
        }
      }
    } catch (error) {
      if (page === 1) {
        this.dolls.set([]);
        this.totalCount.set(0);
      }
      console.error('Failed to load collection dolls:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
