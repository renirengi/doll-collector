import { Component, inject } from '@angular/core';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { RouterLink } from '@angular/router';
import { UserComponent } from '../user/user.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, UserComponent],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: 'header.component.scss',
})
export class Header {
  protected ui = inject(UserspaceStateService);
  private readonly authService = inject(AuthService);

  /**
   * Data for the user profile component, derived from the auth state.
   */
  protected readonly userData = this.authService.currentUser;
}
