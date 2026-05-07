import {
  Component,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../services/collection.service';

/**
 * Full-screen mobile navigation menu component.
 * Uses a tiled layout for better accessibility on touch devices.
 */
@Component({
  selector: 'app-user-mobile-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `<div class="mobile-menu-overlay">
    <div class="m-header">
      <div class="user-brief">
        <span class="greeting">Collector</span>
        <span class="name">{{ displayName() }}</span>
      </div>
      <button
        class="close-btn"
        (click)="menuClose.emit()"
        aria-label="Close menu"
      >
        ✕
      </button>
    </div>

    <nav class="tiles-container">
      @for (item of menuItems(); track item.route) {
        <a
          [routerLink]="item.route"
          routerLinkActive="active"
          (click)="menuClose.emit()"
          class="menu-tile icon-toggle"
        >
          <div class="icon-wrapper">
            <span class="icon" [ngClass]="item.iconClass"></span>
          </div>
        </a>
      }
    </nav>

    <ul class="menu-list">
      <li>
        <a
          routerLink="/user/settings"
          (click)="menuClose.emit()"
          class="link-settings"
        >
          <span>Settings</span>
        </a>
      </li>
      <li>
        <a
          routerLink="/user/support"
          (click)="menuClose.emit()"
          class="link-support"
        >
          <span>Help & Support</span>
        </a>
      </li>

      <li>
        <a
          routerLink="/admin-panel"
          (click)="menuClose.emit()"
          class="link-admin"
        >
          <span>Admin Area</span>
        </a>
      </li>
    </ul>

    <div class="m-footer">
      @if (canCreateCollection()) {
        <button
          (click)="createCollection.emit()"
          class="btn-create icon-toggle"
        >
          <span class="icon icon-star-shine small-icon"></span>
          <span>Create Collection</span>
        </button>
      }
      <button (click)="logout.emit()" class="btn-logout icon-toggle">
        <span class="icon icon-logout small-icon"></span>
        <span>Log Out</span>
      </button>
    </div>
  </div>`,
  styleUrls: ['./user-mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMobileMenuComponent {
  /** Centralized service for accessing the navigation structure. */
  private readonly collectionService = inject(CollectionService);

  /** The name of the user to display in the menu header. */
  public readonly displayName = input.required<string>();

  public readonly canCreateCollection = input<boolean>(false);

  /** Reactive list of menu items (static pages + dynamic collections). */
  public readonly menuItems = this.collectionService.fullMenu;

  /** Event emitted to notify the parent to close the menu. */
  public readonly menuClose = output<void>();

  /** Event emitted to trigger the logout process. */
  public readonly logout = output<void>();

  /** Event emitted to trigger the collection creation modal. */
  public readonly createCollection = output<void>();
}
