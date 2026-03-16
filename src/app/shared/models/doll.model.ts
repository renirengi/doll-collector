import * as T from './doll-enums';

export interface DollImage {
  imageUrl: string;
  notesImage: string;
}

export interface DollPurchaseCondition {
  state: T.DollState;
  outfit: T.OutfitState;
  defects?: string[];
}

export interface Pet {
  type: string;
  name: string;
  notes?: string;
}

export interface Doll {
  id: string;
  itemNumber?: string;
  originalName: string;
  name?: string;
  brand: T.DollBrand;
  series: string;
  manufacturer: T.Manufacturer;
  generation?: T.DollGeneration;
  mold?: string;
  releaseYear?: number;
  acquisitionYear?: number;

  articulation: T.ArticulationType;
  bodyVolume: T.BodyVolume;
  footType: T.FootType;

  purchaseCondition: DollPurchaseCondition;

  isPlayset: boolean;
  playsetsElements?: string[];
  playsetDollsIds?: string[];

  photos?: DollImage[];
  notes?: string[];
  coupleId?: string;
  coupleName?: string;

  washSchedule?: Date | string;
  status: T.DollStatus;

  price?: number;
  soldPrice?: number;
  soldDate?: Date | string;

  pets?: Pet[];
  familyNames?: string[];
  gender: T.Gender;
}
