import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DollCatalogFilters } from '../../app/shared/models/doll-filters.model';
import { Doll } from '../../app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class DollApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/doll';

  /**
   * Fetches dolls from the server based on catalog and user-specific filters.
   * Uses POST /doll/filter if selection criteria are provided,
   * otherwise falls back to GET /doll/all for simple fetching.
   * Pagination parameters (_page, _limit) are always sent as query parameters.
   * @param filters - Selection criteria (including nested userFilters) and pagination parameters.
   * @returns A promise that resolves to an array of dolls.
   */
  public async getAll(filters: DollCatalogFilters): Promise<Doll[]> {
    const { _page, _limit, _sort, _order, userFilters, ...catalogCriteria } =
      filters;

    /**
     * Merge catalog-level criteria with nested user-specific filters into a single body.
     * This creates a flat object for the POST body as required by the backend.
     */
    const combinedCriteria = {
      ...catalogCriteria,
      ...(userFilters || {}),
    };

    // Filter out null, undefined, empty strings, and empty arrays from the criteria body
    const cleanCriteria = Object.fromEntries(
      Object.entries(combinedCriteria).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null && v !== '';
      }),
    );

    const hasCriteria = Object.keys(cleanCriteria).length > 0;

    // Build pagination and sorting query parameters
    let params = new HttpParams()
      .set('_page', _page?.toString() || '1')
      .set('_limit', _limit?.toString() || '12');

    if (_sort) params = params.set('_sort', _sort);
    if (_order) params = params.set('_order', _order);

    if (hasCriteria) {
      /**
       * Use POST method for complex filtering as per Swagger documentation.
       * Combined criteria are sent in the request body, while pagination stays in query params.
       */
      return firstValueFrom(
        this.http.post<Doll[]>(`${this.apiUrl}/filter`, cleanCriteria, {
          params,
        }),
      );
    }

    /**
     * Default to GET /all if no filters are selected.
     */
    return firstValueFrom(
      this.http.get<Doll[]>(`${this.apiUrl}/all`, { params }),
    );
  }

  /**
   * Fetches a single doll by its unique identifier.
   * @param id - The unique UUID of the doll.
   * @returns A promise that resolves to the doll object.
   */
  public async getById(id: string): Promise<Doll> {
    return firstValueFrom(this.http.get<Doll>(`${this.apiUrl}/${id}`));
  }

  /**
   * Creates a new doll entry in the user's collection.
   * @param data - Partial doll data to be saved.
   * @returns A promise that resolves to the newly created doll.
   */
  public async create(data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.post<Doll>(this.apiUrl, data));
  }

  /**
   * Updates an existing doll's information via partial update (PATCH).
   * @param id - The unique UUID of the doll to update.
   * @param data - The fields to be updated.
   * @returns A promise that resolves to the updated doll object.
   */
  public async update(id: string, data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.patch<Doll>(`${this.apiUrl}/${id}`, data));
  }

  /**
   * Removes a doll from the user's collection.
   * @param id - The unique UUID of the doll to be deleted.
   * @returns A promise that resolves when the deletion is complete.
   */
  public async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
