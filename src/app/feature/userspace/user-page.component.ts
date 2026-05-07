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

  /**
   * Reactive signal representing the complete list of sidebar items.
   * Derived directly from the service to avoid local state duplication.
   */
  public readonly sidebarItems = this.collectionService.fullMenu;
}
