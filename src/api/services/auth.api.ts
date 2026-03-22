import { apiClient } from '../config';
import {
  LoginCredentials,
  AuthResponse,
  User
} from '../../app/shared/models/auth.model';

export class AuthApiService {
  private static readonly authUrl = '/auth';
  private readonly userUrl = '/user';

  /**
   * Authenticate user and receive a JWT token with user profile.
   * @param credentials - User email and password.
   * @returns Promise with AuthResponse (token + user data).
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient<AuthResponse>(`${this.authUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Fetch user profile data by their unique ID.
   * @param id - The UUID of the user.
   * @returns Promise with the User object.
   */
  static async getUserById(id: string): Promise<User> {
    return apiClient<User>(`/user/${id}`);
  }

  /**
   * Fetch user profile data by their unique username.
   * @param username - The unique username string.
   * @returns Promise with the User object.
   */
  static async getUserByUsername(username: string): Promise<User> {
    return apiClient<User>(`/user/${username}`);
  }

  /**
   * Optional: Fetch the currently authenticated user's profile.
   * Usually mapped to /auth/me or /user/profile depending on backend.
   */
  static async getMe(): Promise<User> {
    return apiClient<User>(`${this.authUrl}/me`);
  }
}
