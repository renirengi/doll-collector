import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Collection,
  CreateCollectionDto,
  AddDollToCollectionDto,
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
   * @returns Observable of Collection array.
   */
  public getAll(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.url);
  }

  /**
   * Creates a new collection.
   * @param dto Data for the new collection.
   * @returns Observable of the created Collection.
   */
  public create(dto: CreateCollectionDto): Observable<Collection> {
    return this.http.post<Collection>(this.url, dto);
  }

  /**
   * Adds an existing doll to a specific collection.
   * @param dto Object containing collectionId and dollId.
   * @returns Observable of the updated Collection.
   */
  public addDoll(dto: AddDollToCollectionDto): Observable<Collection> {
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
