import * as T from './doll-enums';

export interface DollImage {
  url: string;
  description: string | null;
}

export interface Pet {
  id?: string;
  dollsId: Doll[];
  version?: string;
  type: string;
  name?: string;
  notes?: string;
}
export interface Hybrid {
  head: string;
  body: string;
}

export interface Doll {
  id: string;
  itemNumber?: string;
  originalName: string;

  brand: T.DollBrand;
  series: string;
  manufacturer: T.Manufacturer;
  generation?: T.DollGeneration;
  mold?: string;
  releaseYear?: number;

  articulation: T.ArticulationType;
  bodyVolume: T.BodyVolume;
  footType: T.FootType;

  isPlayset: boolean;
  playsetsElements?: string[];
  playsetDollsIds?: string[];

  photos?: DollImage[];

  pets?: Pet[];
  gender: T.Gender;
}

export interface UserDoll {
  id: string;
  name?: string;
  base: Doll;
  acquisitionYear?: number;
  status: T.DollStatus;
  purchaseState: T.DollState;
  defects?: string[];
  coupleId?: string;
  notes?: string[];
  soldPrice?: number;
  soldDate?: Date | string;
  familyNames?: string[];
  hybrid?: Hybrid;
  collectionIds?: string[];
  outfitState: T.OutfitState;
  photos?: DollImage[];
  pets: Pet[];
  coupleName?: string;
  washSchedule?: Date | string;
}

export type DollDataType = Doll | UserDoll;

export interface DollsResponseDTO {
  data: Doll[];
  _page: number;
  _limit: number;
}

export interface UserDollResponseDTO {
  data: UserDoll[];
  total: number;
  page: number;
  limit: number;
}
