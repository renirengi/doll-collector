import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DollCatalogFilters } from '../../app/shared/models/doll-filters.model';
import { Doll } from '../../app/shared/models';

/**
 * Service responsible for interacting with the /dolls API endpoints.
 * Handles filtering, sorting, and CRUD operations for the doll collection.
 */
@Injectable({
  providedIn: 'root',
})
export class DollApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/dolls';

  /**
   * Orchestrates doll data fetching by deciding between simple listing,
   * complex filtering, or specialized sorting endpoints.
   * * @param filters - Configuration object containing pagination, sorting, and criteria.
   * @returns A promise resolving to an array of Doll objects.
   * @throws Will throw an error if the backend returns a non-2xx response.
   */
  public async getAll(filters: DollCatalogFilters): Promise<Doll[]> {
    const { _page, _limit, _sort, _order, userFilters, ...catalogCriteria } =
      filters;

    // 1. Specialized Sorting Logic
    // If sort parameters are present, bypass standard filters and use sorting endpoints.
    if (_sort && _order) {
      const isOwned = !!userFilters;
      const url = isOwned ? `${this.apiUrl}/sortOwned` : `${this.apiUrl}/sort`;

      const sortBody = isOwned
        ? { ownedDollSortBy: _sort, dollSortOrder: _order }
        : { dollSortBy: _sort, dollSortOrder: _order };

      return firstValueFrom(this.http.post<Doll[]>(url, sortBody));
    }

    // 2. Criteria Mapping & Flattening
    // Merge catalog-level criteria with user-specific filters into a flat object.
    const combinedCriteria = {
      ...catalogCriteria,
      ...(userFilters || {}),
    };

    /**
     * Map frontend property names to match the backend Swagger naming convention.
     * purchaseStates -> purchaseState
     * status -> dollStatus
     */
    const mappedCriteria: any = { ...combinedCriteria };
    if (mappedCriteria.purchaseStates) {
      mappedCriteria.purchaseState = mappedCriteria.purchaseStates;
      delete mappedCriteria.purchaseStates;
    }
    if (mappedCriteria.status) {
      mappedCriteria.dollStatus = mappedCriteria.status;
      delete mappedCriteria.status;
    }

    // Remove empty arrays, nulls, and undefined values to keep the request body clean.
    const cleanCriteria = Object.fromEntries(
      Object.entries(mappedCriteria).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null && v !== '';
      }),
    );

    // 3. Request Execution
    // Set pagination query parameters.
    const params = new HttpParams()
      .set('_page', _page?.toString() || '1')
      .set('_limit', _limit?.toString() || '12');

    // Use POST /filter for complex criteria, otherwise fallback to GET /all.
    if (Object.keys(cleanCriteria).length > 0) {
      return firstValueFrom(
        this.http.post<Doll[]>(`${this.apiUrl}/filter`, cleanCriteria, {
          params,
        }),
      );
    }

    return firstValueFrom(
      this.http.get<Doll[]>(`${this.apiUrl}/all`, { params }),
    );
  }

  /**
   * Retrieves a single doll record by its unique identifier.
   * @param id - The UUID of the doll.
   */
  public async getById(id: string): Promise<Doll> {
    return firstValueFrom(this.http.get<Doll>(`${this.apiUrl}/${id}`));
  }

  /**
   * Persists a new doll entry.
   * @param data - Partial doll data for creation.
   */
  public async create(data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.post<Doll>(this.apiUrl, data));
  }

  /**
   * Performs a partial update on an existing doll record.
   * @param id - The UUID of the target doll.
   * @param data - The fields to be updated.
   */
  public async update(id: string, data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(
      this.http.patch<Doll>(`${this.apiUrl}/${id}/update`, data),
    );
  }

  /**
   * Permanently deletes a doll record and its associated metadata.
   * @param id - The UUID of the doll to remove.
   */
  public async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
