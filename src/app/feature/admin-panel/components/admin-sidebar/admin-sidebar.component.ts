import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatListModule, RouterModule],
  template: `
    <mat-list>
      @for (item of menu; track item) {
        <mat-list-item>
          <a
            [routerLink]="[item.route]"
            routerLinkActive
            #rla="routerLinkActive"
          >
            <mat-icon
              class="icon"
              [style.color]="rla.isActive ? 'red' : ''"
              matListItemIcon
              >{{ item.icon }}</mat-icon
            >
          </a>
        </mat-list-item>
      }
    </mat-list>
  `,
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent {
  protected readonly menu = [
    { name: 'EventLog', icon: 'list', route: '/admin-panel/eventlog' },
    { name: 'SupportTickets', icon: 'build', route: '/admin-panel/support' },
    { name: 'Questions', icon: 'live_help', route: '/admin-panel/questions' },
    {
      name: 'QuestionsCategory',
      icon: 'category',
      route: '/admin-panel/questions-categories',
    },
    {
      name: 'UserAccounts',
      icon: 'groups',
      route: '/admin-panel/user-accounts',
    },
    { name: 'Plan', icon: 'payments', route: '/admin-panel/plans-page' },
    { name: 'Exit', icon: 'power_settings_circle', route: '/user/chat' },
  ];
}
