import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidebarItem } from '../../../shared/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatTooltipModule],
  template: `
    <aside [class]="variantClass()">
      <div class="sidebar-logo"></div>
      <nav>
        <ul class="sidebar-menu">
          @for (item of items(); track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active"
                class="icon-toggle"
                [matTooltip]="item.label"
                matTooltipPosition="right"
              >
                <span class="icon" [class]="getIconClass(item)"></span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </aside>
  `,
  styleUrl: './sidebar.component.scss',
})
export class Sidebar {
  items = input.required<SidebarItem[]>();
  variantClass = input<string>('user-sidebar');

  getIconClass(item: SidebarItem): string {
    if (item.icon) {
      const fileName = item.icon.split('/').pop()?.split('.')[0];
      if (fileName) {
        return `icon-${fileName.replace(/_/g, '-')}`;
      }
    }

    if (item.iconClass) {
      return item.iconClass;
    }

    return 'icon-crown';
  }
}
