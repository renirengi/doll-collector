import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Collection,
  CreateCollectionResponseDto,
  AddDollToCollectionResponseDto,
  CollectionsResponseDTO,
} from '../../app/shared/models/collection.model';
import { API_URL } from '../config';

/**
 * Service responsible for low-level API interactions with collection endpoints.
 */
@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/collections`;

  /**
   * Retrieves all collections for the authenticated user.
   * @returns Observable of CollectionsDTO.
   */
  public getAll(
    page: number = 1,
    limit: number = 12,
  ): Observable<CollectionsResponseDTO> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    return this.http.get<CollectionsResponseDTO>(this.url, { params });
  }

  /**
   * Creates a new collection.
   * @param dto Data for the new collection.
   * @returns Observable of the created Collection.
   */
  public create(dto: CreateCollectionResponseDto): Observable<Collection> {
    return this.http.post<Collection>(this.url, dto);
  }

  /**
   * Adds an existing doll to a specific collection.
   * @param dto Object containing collectionId and dollId.
   * @returns Observable of the updated Collection.
   */
  public addDoll(dto: AddDollToCollectionResponseDto): Observable<Collection> {
    return this.http.post<Collection>(`${this.url}/newdoll`, dto);
  }

  /**
   * Deletes a collection by its unique identifier.
   * @param id Unique ID of the collection.
   * @returns Observable of void.
   */
  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
