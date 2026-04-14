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

export interface CreateCollectionDto {
  name: string;
  description: string;
  icon: string;
}

export interface AddDollToCollectionDto {
  collectionId: string;
  dollId: string;
}
