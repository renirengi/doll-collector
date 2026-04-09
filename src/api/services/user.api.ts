import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import { User } from '../../app/shared/models';

/**
 * Low-level API service for User-related HTTP requests.
 * Directly maps to updated Swagger endpoints.
 */
@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly targetUrl = `${API_URL}/users`;

  /**
   * Fetches all users from the server.
   * Endpoint: GET /users
   */
  public findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.targetUrl);
  }

  /**
   * Fetches a single user by their UUID.
   * Endpoint: GET /users/id/{id}
   */
  public findById(id: string): Observable<User> {
    // Added '/id/' segment to match new backend routing
    return this.http.get<User>(`${this.targetUrl}/id/${id}`);
  }

  /**
   * Fetches a single user by their unique username.
   * Endpoint: GET /users/username/{username}
   */
  public findByUsername(username: string): Observable<User> {
    // Changed path from '/by-username/' to '/username/' as per Swagger
    return this.http.get<User>(`${this.targetUrl}/username/${username}`);
  }
}
