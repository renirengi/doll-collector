import { Component, ViewEncapsulation } from '@angular/core';
import { Header } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-user-page',
  imports: [Header, RouterOutlet, Sidebar],
  template: `
    <app-header></app-header>
    <!-- <app-user-sidebar-mobile></app-user-sidebar-mobile> -->

    <section class="user-page-container">
      <app-sidebar></app-sidebar>
      <router-outlet></router-outlet>
    </section>

    <!-- <app-footer></app-footer> -->
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrl: './user-page.component.scss',
})
export class UserPageComponent {}
