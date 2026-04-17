import * as T from './doll-enums';

export interface OwnedDollFilterCriteria {
  base?: {
    articulation?: T.ArticulationType[];
    bodyVolume?: T.BodyVolume[];
    brand?: T.DollBrand[];
    footType?: T.FootType[];
    gender?: T.Gender[];
    generation?: T.DollGeneration[];
    manufacturer?: string[];
    releaseYear?: number[];
  };
  purchaseState?: T.DollState[];
  status?: T.DollStatus[];
  outfitState?: T.OutfitState[];
  acquisitionYear?: number[];
  hasCouple?: boolean;
  hybrid?: boolean;
}

export interface OwnedDollSortCriteria {
  ownedDollSortBy: 'soldPrice' | 'acquisitionYear' | 'createdAt' | 'name';
  ownedDollSortOrder: 'ASC' | 'DESC';
}

export interface OwnedDollSortAndFilterDto {
  filterCriteria: OwnedDollFilterCriteria;
  sortCriteria: OwnedDollSortCriteria;
}
