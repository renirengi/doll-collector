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
  dollId: string;
  acquisitionYear?: number;
  name?: string;
  dollState: T.DollState;
  outfitState: T.OutfitState;
  defects?: string[];

  userPhotos?: DollImage[];
  notes?: string[];
  coupleId?: string;
  coupleName?: string;

  washSchedule?: Date | string;
  status: T.DollStatus;

  price?: number;
  soldPrice?: number;
  soldDate?: Date | string;

  familyNames?: string[];
  hybrid?: Hybrid;
}

export interface EnrichedUserDoll extends UserDoll {
  catalogInfo: Doll;
}

export type DollDataType = Doll | EnrichedUserDoll;

export interface DollsResponseDTO {
  data: Doll[];
  _page: number;
  _limit: number;
}
