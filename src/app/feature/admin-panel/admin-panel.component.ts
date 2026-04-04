import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';

@Component({
  selector: 'app-admin-panel',
  imports: [AdminSidebarComponent, RouterOutlet],
  template: `
    <app-admin-sidebar></app-admin-sidebar>
    <router-outlet></router-outlet>
  `,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../../../styles/auth-pages.scss'],
})
export class AdminPanelComponent {}
