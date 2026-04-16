import { Doll, UserDoll } from './doll.model';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  dolls?: Doll[];
  ownedDolls?: UserDoll[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollectionResponseDto {
  name: string;
  description: string;
  icon: string;
}

export interface AddDollToCollectionResponseDto {
  collectionId: string;
  dollId: string;
}

export interface CollectionsResponseDTO {
  data: Collection[];
  _page: number;
  _limit: number;
  total?: number;
}
