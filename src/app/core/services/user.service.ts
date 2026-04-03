import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserApiService } from '../../../api/services/user.api';
import { User } from '../../shared/models';

/**
 * High-level service for managing user data within the application.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userApi = inject(UserApiService);

  /**
   * Retrieves a full user profile synchronously.
   * Used during the login phase to hydrate the global state.
   * @param id The user's UUID.
   */
  public async getProfileSync(id: string): Promise<User> {
    return await firstValueFrom(this.userApi.findById(id));
  }

  /**
   * Provides access to all users (e.g., for a community/search page).
   */
  public async fetchAll(): Promise<User[]> {
    return await firstValueFrom(this.userApi.findAll());
  }
}
