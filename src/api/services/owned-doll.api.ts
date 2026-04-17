import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config';
import {
  OwnedDollFilterCriteria,
  OwnedDollSortAndFilterDto,
  OwnedDollSortCriteria,
  UserDoll,
  UserDollResponseDTO,
} from '../../app/shared/models';

/**
 * Comprehensive API service for managing owned dolls.
 * Aligned with Swagger endpoints for filtering, sorting, and CRUD operations.
 */
@Injectable({
  providedIn: 'root',
})
export class OwnedDollApiService {
  private readonly http = inject(HttpClient);
  private readonly targetUrl = `${API_URL}/owned-dolls`;

  /**
   * Returns all dolls owned by the current user with basic pagination.
   * Endpoint: GET /owned-dolls
   */
  public findAll(
    page: number = 1,
    limit: number = 12,
  ): Observable<UserDollResponseDTO> {
    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.get<UserDollResponseDTO>(this.targetUrl, { params });
  }

  /**
   * Returns all dolls by user ID (alternative full list).
   * Endpoint: GET /owned-dolls/all
   */
  public findAllByUser(
    page: number = 1,
    limit: number = 12,
  ): Observable<UserDollResponseDTO> {
    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.get<UserDollResponseDTO>(`${this.targetUrl}/all`, {
      params,
    });
  }

  /**
   * Retrieves a single owned doll by its unique ID.
   * Endpoint: GET /owned-dolls/{id}
   */
  public findById(id: string): Observable<UserDoll> {
    return this.http.get<UserDoll>(`${this.targetUrl}/${id}`);
  }

  /**
   * Filters owned dolls based on specific criteria.
   * Endpoint: POST /owned-dolls/filter
   */
  public filter(
    criteria: OwnedDollFilterCriteria,
    page: number = 1,
    limit: number = 12,
  ): Observable<UserDollResponseDTO> {
    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.post<UserDollResponseDTO>(
      `${this.targetUrl}/filter`,
      criteria,
      { params },
    );
  }

  /**
   * Sorts owned dolls based on specific criteria.
   * Endpoint: POST /owned-dolls/sort
   */
  public sort(
    criteria: OwnedDollSortCriteria,
    page: number = 1,
    limit: number = 12,
  ): Observable<UserDollResponseDTO> {
    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.post<UserDollResponseDTO>(
      `${this.targetUrl}/sort`,
      criteria,
      { params },
    );
  }

  /**
   * Combined endpoint for both filtering and sorting.
   * Endpoint: POST /owned-dolls/sort-and-filter
   */
  public sortAndFilter(
    dto: OwnedDollSortAndFilterDto,
    page: number = 1,
    limit: number = 12,
  ): Observable<UserDollResponseDTO> {
    const params = new HttpParams().set('_page', page).set('_limit', limit);
    return this.http.post<UserDollResponseDTO>(
      `${this.targetUrl}/sort-and-filter`,
      dto,
      { params },
    );
  }

  /**
   * Creates a new record in the user's shelf.
   * Endpoint: POST /owned-dolls
   */
  public create(dollData: Partial<UserDoll>): Observable<UserDoll> {
    return this.http.post<UserDoll>(this.targetUrl, dollData);
  }

  /**
   * Updates an existing owned doll's metadata.
   * Endpoint: PATCH /owned-dolls/{id}
   */
  public update(id: string, dollData: Partial<UserDoll>): Observable<UserDoll> {
    return this.http.patch<UserDoll>(`${this.targetUrl}/${id}`, dollData);
  }

  /**
   * Removes a doll from the user's collection.
   * Endpoint: DELETE /owned-dolls/{id}
   */
  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.targetUrl}/${id}`);
  }
}
