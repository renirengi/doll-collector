import {
  Component,
  HostListener,
  inject,
  input,
  computed,
  signal,
  ChangeDetectionStrategy,
  viewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AvatarComponent } from '../avatar/avatar.component';
import { User, UserRoles } from '../../../../shared/models';
import { AuthService } from '../../../../core/services/auth.service';
import { ModalComponent } from '../../../../core/components/modal/modal.component';
import { CreateCollectionFormComponent } from '../create-collection-form/create-collection-form.component';
import { UserDesktopMenuComponent } from '../../../../core/components/user-desktop-menu/user-desktop-menu.component';
import { UserMobileMenuComponent } from '../../../../core/components/user-mobile-menu/user-mobile-menu.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    AvatarComponent,
    ModalComponent,
    CreateCollectionFormComponent,
    UserDesktopMenuComponent,
    UserMobileMenuComponent,
  ],
  template: `<div class="user-menu-container">
      <div
        class="active-user"
        [class.open]="menuOpen()"
        (click)="toggleMenu($event)"
      >
        <app-avatar
          [src]="userData()?.avatar"
          [name]="displayName()"
          [size]="'w-11 h-11'"
          class="user-avatar-shadow"
          [class.active-ring]="menuOpen()"
        ></app-avatar>
      </div>

      @if (menuOpen()) {
        <app-user-desktop-menu
          class="desktop-menu-only"
          [user]="userData()"
          [displayName]="displayName()"
          [canCreateCollection]="true"
          (menuClose)="closeMenu()"
          (createCollection)="openCreateModal()"
        ></app-user-desktop-menu>

        <!-- Mobile -->
        <app-user-mobile-menu
          class="mobile-menu-only"
          [displayName]="displayName()"
          [canCreateCollection]="true"
          (menuClose)="closeMenu()"
          (createCollection)="openCreateModal()"
          (logout)="onLogout()"
        ></app-user-mobile-menu>
      }
    </div>
    <app-modal class="user-modal" #createModal title="New Collection">
      <app-create-collection-form
        (success)="createModal.closeModal()"
      ></app-create-collection-form>
    </app-modal>`,
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  private readonly authService = inject(AuthService);
  private readonly createCollectionModal =
    viewChild<ModalComponent>('createModal');

  public readonly userData = input<User | null | undefined>(undefined);

  public readonly menuOpen = signal<boolean>(false);

  public readonly isAdmin = computed<boolean>(() => {
    const role = this.userData()?.role;
    return role === UserRoles.Admin;
  });

  /**
   * Computed string representing the user's identification.
   * Uses username as primary display value, falls back to 'Guest'.
   */
  public readonly displayName = computed<string>(() => {
    const user = this.userData();

    console.log('User data in Component:', user);

    if (!user) return 'Guest';
    return user.username || 'Guest';
  });

  public toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  public closeMenu(): void {
    this.menuOpen.set(false);
  }

  public onLogout(): void {
    this.closeMenu();

    this.authService.logout();
  }

  @HostListener('document:click')
  public onOutsideClick(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    }
  }

  public openCreateModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.closeMenu();
    this.createCollectionModal()?.showModal();
  }
}
