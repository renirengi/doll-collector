import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { DollFilters } from '../../app/shared/models/doll-filters.model';
import { Doll } from '../../app/shared/models';
@Injectable({
  providedIn: 'root',
})
export class DollApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/doll';

  /**
   * Fetches dolls from the server based on provided filters.
   * HttpClient handles 304 Not Modified automatically by returning cached data.
   * @param filters - Selection and pagination criteria.
   */
  public async getAll(filters: DollFilters): Promise<Doll[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => (params = params.append(key, v.toString())));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return firstValueFrom(
      this.http.get<Doll[]>(`${this.apiUrl}/all`, { params }),
    );
  }

  /**
   * Fetches a single doll by its unique identifier.
   * @param id - Doll ID.
   */
  public async getById(id: string): Promise<Doll> {
    return firstValueFrom(this.http.get<Doll>(`${this.apiUrl}/${id}`));
  }

  /**
   * Creates a new doll entry.
   * @param data - Partial doll data.
   */
  public async create(data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.post<Doll>(this.apiUrl, data));
  }

  /**
   * Updates an existing doll via PATCH.
   * @param id - Doll ID.
   * @param data - Fields to update.
   */
  public async update(id: string, data: Partial<Doll>): Promise<Doll> {
    return firstValueFrom(this.http.patch<Doll>(`${this.apiUrl}/${id}`, data));
  }

  /**
   * Removes a doll from the collection.
   * @param id - Doll ID.
   */
  public async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
