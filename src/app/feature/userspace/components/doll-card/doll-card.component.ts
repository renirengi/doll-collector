import { Component, computed, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CollectionService } from '../../../../core/services/collection.service';
import {
  Doll,
  UserDoll,
  DollDataType,
  SidebarItem,
} from '../../../../shared/models';

@Component({
  selector: 'app-doll-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './doll-card.component.html',
  styleUrls: ['./doll-card.component.scss'],
})
export class DollCardComponent {
  private readonly router = inject(Router);
  private readonly collectionService = inject(CollectionService);

  @Input({ required: true }) doll!: DollDataType;

  /**
   * Static menu actions for system folders.
   */
  private readonly staticActions: SidebarItem[] = [
    {
      id: 'favorites',
      route: '/user/favorites',
      iconClass: 'icon-favorite',
      label: 'My wish',
    },
    {
      id: 'shelf',
      route: '/user/shelf',
      iconClass: 'icon-shelves',
      label: 'My shelf',
    },
    {
      id: 'shop',
      route: '/user/shop',
      iconClass: 'icon-shop',
      label: 'My shop',
    },
    {
      id: 'sold',
      route: '/user/sold-doll',
      iconClass: 'icon-sold-doll',
      label: 'Sold',
    },
  ];

  /**
   * Computed list of actions available for this doll based on current route.
   */
  protected readonly availableActions = computed<SidebarItem[]>(() => {
    const currentUrl: string = this.router.url;
    const allActions: SidebarItem[] = [
      ...this.staticActions,
      ...this.collectionService.menuItems(),
    ];

    return allActions.filter(
      (action: SidebarItem) =>
        action.route && !currentUrl.includes(action.route),
    );
  });

  /**
   * Helper getter to access base doll data regardless of wrapper type.
   */
  public get d(): Doll {
    return this.isUserDoll(this.doll) ? this.doll.base : this.doll;
  }

  /**
   * Handles navigation to the doll details page.
   */
  public onCardClick(): void {
    // Logic for navigating to details, e.g.:
    // void this.router.navigate(['/catalog', this.d.id]);
    console.log('Navigating to doll details:', this.d.id);
  }

  /**
   * Processes specific actions like adding to a collection.
   * @param actionId - Target action or collection UUID.
   * @param event - DOM event to prevent bubbling.
   */
  public onAction(actionId: string, event: Event): void {
    event.stopPropagation();

    if (this.isCustomCollection(actionId)) {
      void this.collectionService.addToCollection(actionId, this.d.id);
    }
  }

  /**
   * Type guard to check if the doll is in a personal collection.
   * @param data - The doll data object.
   */
  public isUserDoll(data: DollDataType): data is UserDoll {
    return (data as UserDoll).base !== undefined;
  }

  /**
   * Checks if action ID belongs to user-defined collections.
   * @param id - UUID to check.
   */
  private isCustomCollection(id: string): boolean {
    return this.collectionService.collections().some((col) => col.id === id);
  }
}
