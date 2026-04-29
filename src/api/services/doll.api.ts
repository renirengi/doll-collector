import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DollCatalogFilters } from '../../app/shared/models/doll-filters.model';
import { Doll, DollsResponseDTO } from '../../app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class DollApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/dolls';

  /**
   * Main entry point for fetching dolls with any combination of search parameters.
   * @param filters Combined filter, sort, and pagination state.
   */
  public async getAll(filters: DollCatalogFilters): Promise<DollsResponseDTO> {
    const { _page, _limit, _sort, _order, ...catalogCriteria } = filters;
    const params = this.buildPaginationParams(_page, _limit);
    const cleanFilter = this.extractCleanCriteria(catalogCriteria);

    const hasFilters = Object.keys(cleanFilter).length > 0;
    const hasSorting = !!(_sort && _order);

    if (hasFilters && hasSorting) {
      return this.fetchSortAndFilter(cleanFilter, _sort, _order, params);
    }
    if (hasSorting) {
      return this.fetchSorted(_sort, _order, params);
    }
    if (hasFilters) {
      return this.fetchFiltered(cleanFilter, params);
    }

    return firstValueFrom(
      this.http.get<DollsResponseDTO>(`${this.apiUrl}/all`, { params }),
    );
  }

  /**
   * Fetches a single doll by its unique identifier.
   * @param id The UUID of the doll.
   */
  public getById(id: string): Promise<Doll> {
    return firstValueFrom(this.http.get<Doll>(`${this.apiUrl}/${id}`));
  }

  /**
   * Creates a new doll record.
   * @param doll Data for the new doll.
   */
  public create(doll: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.post<Doll>(this.apiUrl, doll));
  }

  /**
   * Updates an existing doll by ID.
   * @param id The UUID of the doll to update.
   * @param doll Partial data to apply.
   */
  public update(id: string, doll: Partial<Doll>): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.apiUrl}/${id}/update`, doll),
    );
  }

  /**
   * Permanently deletes a doll and its associated data.
   * @param id The UUID of the doll to delete.
   */
  public delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  /**
   * Builds standard pagination parameters.
   */
  private buildPaginationParams(page?: number, limit?: number): HttpParams {
    return new HttpParams()
      .set('_page', page?.toString() || '1')
      .set('_limit', limit?.toString() || '12');
  }

  /**
   * Filters out empty arrays, null, or undefined values from criteria.
   */
  private extractCleanCriteria(
    criteria: Record<string, unknown>,
  ): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(criteria).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== null && v !== '';
      }),
    );
  }

  /**
   * Internal handler for combined sort and filter POST request.
   */
  private fetchSortAndFilter(
    filter: Record<string, unknown>,
    sortBy: string,
    order: string,
    params: HttpParams,
  ): Promise<DollsResponseDTO> {
    const body = {
      filterCriteria: filter,
      sortCriteria: { dollSortBy: sortBy, dollSortOrder: order },
    };
    return firstValueFrom(
      this.http.post<DollsResponseDTO>(`${this.apiUrl}/sort-and-filter`, body, {
        params,
      }),
    );
  }

  /**
   * Internal handler for sort-only POST request.
   */
  private fetchSorted(
    sortBy: string,
    order: string,
    params: HttpParams,
  ): Promise<DollsResponseDTO> {
    const body = { dollSortBy: sortBy, dollSortOrder: order };
    return firstValueFrom(
      this.http.post<DollsResponseDTO>(`${this.apiUrl}/sort`, body, { params }),
    );
  }

  /**
   * Internal handler for filter-only POST request.
   */
  private fetchFiltered(
    filter: Record<string, unknown>,
    params: HttpParams,
  ): Promise<DollsResponseDTO> {
    return firstValueFrom(
      this.http.post<DollsResponseDTO>(`${this.apiUrl}/filter`, filter, {
        params,
      }),
    );
  }
}
