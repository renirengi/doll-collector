import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import { User } from '../../app/shared/models';

/**
 * Low-level API service for User-related HTTP requests.
 * Directly maps to Swagger endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly targetUrl = `${API_URL}/users`;

  /**
   * Fetches all users from the server.
   */
  public findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.targetUrl);
  }

  /**
   * Fetches a single user by their UUID.
   */
  public findById(id: string): Observable<User> {
    return this.http.get<User>(`${this.targetUrl}/${id}`);
  }

  /**
   * Fetches a single user by their unique username.
   */
  public findByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.targetUrl}/by-username/${username}`);
  }
}
