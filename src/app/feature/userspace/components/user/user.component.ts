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

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TitleCasePipe,
    AvatarComponent,
    ModalComponent,
    CreateCollectionFormComponent,
  ],
  templateUrl: './user.component.html',
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

  public openCreateModal(event: Event): void {
    event.stopPropagation();
    this.closeMenu();
    this.createCollectionModal()?.showModal();
  }
}
