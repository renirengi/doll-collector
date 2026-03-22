import { Doll } from '../../app/shared/models';
import { apiClient } from '../config';

export class DollApiService {
  private static readonly apiUrl = '/doll';

  /** Get all dolls with filters */
  static async getAll(filters: any): Promise<Doll[]> {
    const query = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString());
        }
      });
    }

    const queryString = query.toString();
    const url = queryString ? `${this.apiUrl}?${queryString}` : this.apiUrl;

    return apiClient<Doll[]>(url);
  }

  /** Get single doll by ID */
  static async getById(id: string): Promise<Doll> {
    return apiClient<Doll>(`${this.apiUrl}/${id}`);
  }

  /** Create new doll */
  static async create(data: Partial<Doll>): Promise<Doll> {
    return apiClient<Doll>(this.apiUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /** Update doll data */
  static async update(id: string, data: Partial<Doll>): Promise<Doll> {
    return apiClient<Doll>(`${this.apiUrl}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /** Delete doll */
  static async delete(id: string): Promise<void> {
    return apiClient<void>(`${this.apiUrl}/${id}`, {
      method: 'DELETE',
    });
  }
}
