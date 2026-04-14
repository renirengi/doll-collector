import { Component, Input, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { CollectionService } from '../../../../core/services/collection.service';
import { IconUtils } from '../../../../shared/utils/icon.utils';
import {
  Doll,
  EnrichedUserDoll,
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

  public isUserDoll(data: DollDataType): data is EnrichedUserDoll {
    return (data as EnrichedUserDoll).dollId !== undefined;
  }

  public get d(): Doll {
    return this.isUserDoll(this.doll) ? this.doll.catalogInfo : this.doll;
  }

  onAction(actionId: string, event: Event): void {
    event.stopPropagation();
    console.log(`[TODO] Move ${this.d.originalName} to: ${actionId}`);
  }

  onCardClick(): void {
    const id = this.isUserDoll(this.doll) ? this.doll.dollId : this.d.id;
    console.log('Клик по кукле:', id);
  }
}
