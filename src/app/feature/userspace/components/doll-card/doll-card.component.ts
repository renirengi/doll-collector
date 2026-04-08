import { Component, Input, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  Doll,
  EnrichedUserDoll,
  DollDataType,
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

  @Input({ required: true }) doll!: DollDataType;

  private readonly actionConfig = [
    { id: 'favorites', route: '/user/favorites', icon: 'icon-favorite' },
    { id: 'shelf', route: '/user/shelf', icon: 'icon-shelves' },
    { id: 'shop', route: '/user/shop', icon: 'icon-shop' },
    { id: 'sold', route: '/user/sold-doll', icon: 'icon-sold-doll' },
  ];

  protected readonly availableActions = computed(() => {
    const currentUrl = this.router.url;
    return this.actionConfig.filter((action) => currentUrl !== action.route);
  });

  public isUserDoll(data: DollDataType): data is EnrichedUserDoll {
    return (data as EnrichedUserDoll).dollId !== undefined;
  }

  public get d(): Doll {
    return this.isUserDoll(this.doll) ? this.doll.catalogInfo : this.doll;
  }

  onAction(actionId: string, event: Event): void {
    event.stopPropagation();
    console.log(
      `[TODO] Переместить ${this.d.originalName} в список: ${actionId}`,
    );
  }

  onCardClick(): void {
    const id = this.isUserDoll(this.doll) ? this.doll.dollId : this.d.id;
    console.log('Клик по кукле:', id);
  }
}
