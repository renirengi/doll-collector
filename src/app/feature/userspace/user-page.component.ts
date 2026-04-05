import { Component, ViewEncapsulation } from '@angular/core';
import { Header } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-user-page',
  imports: [Header, RouterOutlet, Sidebar],
  template: `
    <app-header></app-header>
    <!-- <app-user-sidebar-mobile></app-user-sidebar-mobile> -->

    <section class="user-page-container ml-[75px]">
      <app-sidebar [items]="userMenu" variantClass="user-sidebar"></app-sidebar>
      <router-outlet></router-outlet>
    </section>

    <!-- <app-footer></app-footer> -->
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './user-page.component.scss',
})
export class UserPageComponent {
  public userMenu = [
    { path: 'favorites', iconClass: 'icon-favorite', label: 'My wish' },
    { path: 'shelf', iconClass: 'icon-shelves', label: 'My shelf' },
    { path: 'shop', iconClass: 'icon-shop', label: 'My shop' },
    { path: 'sold-doll', iconClass: 'icon-sold-doll', label: 'Sold' },
  ];
}
