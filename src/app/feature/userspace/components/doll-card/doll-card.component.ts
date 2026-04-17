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
import { Component, computed, inject, Input } from '@angular/core';

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

  protected readonly availableActions = computed(() => {
    const currentUrl = this.router.url;
    return [
      ...this.staticActions,
      ...this.collectionService.menuItems(),
    ].filter((action) => action.route && !currentUrl.includes(action.route));
  });

  /**
   * Type guard to check if the data is a UserDoll (personal collection).
   */
  public isUserDoll(data: DollDataType): data is UserDoll {
    return (data as UserDoll).base !== undefined;
  }

  /**
   * Helper to get common catalog information regardless of the type.
   */
  public get d(): Doll {
    return this.isUserDoll(this.doll) ? this.doll.base : this.doll;
  }

  onAction(actionId: string, event: Event): void {
    event.stopPropagation();
    console.log(`Moving ${this.d.originalName} to: ${actionId}`);
  }

  onCardClick(): void {
    const id = this.doll.id;
    console.log('Clicked doll ID:', id);
    if (this.isUserDoll(this.doll)) {
      console.log('This is a personal shelf item');
    }
  }
}
