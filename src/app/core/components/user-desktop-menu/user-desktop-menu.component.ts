import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { User } from '../../../shared/models';

@Component({
  selector: 'app-user-desktop-menu',
  standalone: true,
  imports: [RouterModule, TitleCasePipe],
  template: `<nav class="custom-menu">
    <div class="user-header">
      <span class="full-name header-name">{{ displayName() }}</span>
      @if (user()?.role) {
        <span class="role-tag">{{ user()?.role | titlecase }}</span>
      }
    </div>

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

      @if (canCreateCollection()) {
        <li>
          <button class="link-add-collection" (click)="createCollection.emit()">
            <span>Create Collection</span>
          </button>
        </li>
      }

      <li>
        <a
          routerLink="/admin-panel"
          (click)="menuClose.emit()"
          class="link-admin"
        >
          <span>Admin Area</span>
        </a>
      </li>

      <li class="separator"></li>
      <li>
        <button
          class="logout-btn"
          (click)="$event.stopPropagation(); menuClose.emit()"
        >
          <span>Log Out</span>
        </button>
      </li>
    </ul>
  </nav>`,
  styleUrls: ['./user-desktop-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDesktopMenuComponent {
  public readonly user = input.required<User | null | undefined>();
  public readonly displayName = input.required<string>();
  public readonly canCreateCollection = input<boolean>(false);

  public readonly menuClose = output<void>();
  public readonly createCollection = output<void>();

  public onActionClick(event: Event, action: 'close' | 'create'): void {
    if (action === 'create') {
      this.createCollection.emit();
    } else {
      this.menuClose.emit();
    }
  }
}
