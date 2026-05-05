import { Component, computed, inject, ViewEncapsulation } from '@angular/core';
import { Header } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar.component';
import { CollectionService } from '../../core/services/collection.service';
import { SidebarItem } from '../../shared/models';
@Component({
  selector: 'app-user-page',
  imports: [Header, RouterOutlet, Sidebar],
  template: `
    <app-header></app-header>

    <section class="user-page-container">
      <app-sidebar
        [items]="sidebarItems()"
        variantClass="user-sidebar"
      ></app-sidebar>
      <router-outlet></router-outlet>
    </section>

    <!-- <app-footer></app-footer> -->
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './user-page.component.scss',
})
export class UserPageComponent {
  private readonly collectionService = inject(CollectionService);

  public readonly sidebarItems = computed<SidebarItem[]>(() => {
    const staticMenu: SidebarItem[] = [
      {
        route: '/user/favorites',
        iconClass: 'icon-favorite',
        label: 'My wish',
      },
      { route: '/user/shelf', iconClass: 'icon-shelves', label: 'My shelf' },
      { route: '/user/shop', iconClass: 'icon-shop', label: 'My shop' },
      { route: '/user/sold-doll', iconClass: 'icon-sold-doll', label: 'Sold' },
    ];

    return [...staticMenu, ...this.collectionService.menuItems()];
  });
}
