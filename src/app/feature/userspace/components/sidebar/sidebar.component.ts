import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatTooltipModule],
  template: `
    <aside class="user-sidebar">
      <nav>
        <ul class="sidebar-menu">
          @for (item of menuItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                routerLinkActive="active"
                class="icon-toggle"
                [matTooltip]="item.label"
                matTooltipPosition="right"
              >
                <span class="icon" [class]="item.iconClass"></span>
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
  protected menuItems = [
    { path: 'favorites', iconClass: 'icon-favorite', label: 'My wish' },
    { path: 'shelf', iconClass: 'icon-shelves', label: 'My shelf' },
    { path: 'shop', iconClass: 'icon-shop', label: 'My shop' },
    { path: 'sold-doll', iconClass: 'icon-sold-doll', label: 'Sold' },
  ];
}
