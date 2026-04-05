import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-admin-panel',
  imports: [Sidebar, RouterOutlet],
  template: `
    <app-sidebar [items]="adminMenu" variantClass="admin-sidebar"></app-sidebar>
    <router-outlet class="ml-[75px]"></router-outlet>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../styles/admin-pages.scss'],
})
export class AdminPanelComponent {
  public adminMenu = [
    { path: 'eventlog', iconClass: 'eventlog', label: 'eventlog' },
    { path: 'support', iconClass: 'support', label: 'support' },
    { path: 'dolls', iconClass: 'dolls', label: 'dolls' },
    { path: 'user-accounts', iconClass: 'users', label: 'user' },
    { path: '/user/catalog', iconClass: 'exit', label: 'exit' },
  ];
}
