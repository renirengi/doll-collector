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
  private readonly apiUrl = '/dolls';

  /**
   * Fetches dolls based on provided filters, sorting criteria, or pagination.
   * Routes the request to specialized endpoints (/sort, /filter, or /all)
   * depending on the complexity of the input.
   */
  public async getAll(filters: DollCatalogFilters): Promise<Doll[]> {
    const { _page, _limit, _sort, _order, userFilters, ...catalogCriteria } =
      filters;

    /**
     * Handle specialized sorting requests.
     */
    if (_sort && _order) {
      const isOwned = !!userFilters;
      const url = isOwned ? `${this.apiUrl}/sortOwned` : `${this.apiUrl}/sort`;
      const sortBody = isOwned
        ? { ownedDollSortBy: _sort, dollSortOrder: _order }
        : { dollSortBy: _sort, dollSortOrder: _order };

      return firstValueFrom(this.http.post<Doll[]>(url, sortBody));
    }

    /**
     * Merge and map criteria to match backend naming conventions.
     */
    const combinedCriteria = {
      ...catalogCriteria,
      ...(userFilters || {}),
    };

    const mappedCriteria: any = {};
    Object.entries(combinedCriteria).forEach(([key, value]) => {
      let backendKey = key;
      if (key === 'purchaseStates') backendKey = 'purchaseState';
      if (key === 'status') backendKey = 'dollStatus';

      mappedCriteria[backendKey] = value;
    });

    /**
     * Clean criteria by removing empty arrays, nulls, and undefined values.
     */
    const cleanCriteria = Object.fromEntries(
      Object.entries(mappedCriteria).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null && v !== '';
      }),
    );

    const params = new HttpParams()
      .set('_page', _page?.toString() || '1')
      .set('_limit', _limit?.toString() || '12');

    /**
     * Use POST /filter for active criteria, otherwise fallback to GET /all.
     */
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
   */
  public async getById(id: string): Promise<Doll> {
    return firstValueFrom(this.http.get<Doll>(`${this.apiUrl}/${id}`));
  }

  /**
   * Creates a new doll record in the database.
   */
  public async create(data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.post<Doll>(this.apiUrl, data));
  }

  /**
   * Updates an existing doll record using partial data.
   */
  public async update(id: string, data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(
      this.http.patch<Doll>(`${this.apiUrl}/${id}/update`, data),
    );
  }

  /**
   * Deletes a doll record and all associated data from the server.
   */
  public async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
