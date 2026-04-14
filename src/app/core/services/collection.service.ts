import { inject, Injectable, signal, computed } from '@angular/core';
import { CollectionApiService } from '../../../api/services/collection.api';
import {
  Collection,
  CreateCollectionDto,
} from '../../shared/models/collection.model';
import { firstValueFrom } from 'rxjs';
import { SidebarItem } from '../../shared/models';
import { IconUtils } from '../../shared/utils';

/**
 * Core service managing collection state and business logic using Signals.
 */
@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly api = inject(CollectionApiService);

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
   * Internal state holding the list of user collections.
   */
  private readonly _collections = signal<Collection[]>([]);

  /**
   * Exposed read-only signal of collections.
   */
  public readonly collections = this._collections.asReadonly();

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
    const data = await firstValueFrom(this.api.getAll());
    this._collections.set(data);
  }

  /**
   * Orchestrates the creation of a new collection and updates the local state.
   * @param dto Collection details from the creation form.
   * @returns The newly created Collection object.
   */
  public async createCollection(dto: CreateCollectionDto): Promise<Collection> {
    const newCol = await firstValueFrom(this.api.create(dto));
    this._collections.update((prev) => [...prev, newCol]);
    return newCol;
  }

  /**
   * Removes a collection and updates the state.
   * @param id The ID of the collection to be removed.
   */
  public async deleteCollection(id: string): Promise<void> {
    await firstValueFrom(this.api.delete(id));
    this._collections.update((prev) => prev.filter((c) => c.id !== id));
  }
}
