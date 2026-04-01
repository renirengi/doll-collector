import * as T from './doll-enums';

/**
 * Represents the combined filtering and pagination state
 * for both the global catalog and the user's personal shelf.
 */
export interface DollCatalogFilters {
  // Pagination (Query params)
  _page?: number;
  _limit?: number;

  // Sorting
  // For /dolls/sort use 'releaseYear'
  // For /dolls/sortOwned use 'soldPrice' or 'acquisitionYear'
  _sort?: 'releaseYear' | 'soldPrice' | 'acquisitionYear' | 'createdAt';
  _order?: 'ASC' | 'DESC'; // Strict uppercase for backend compatibility

  // Catalog Criteria
  manufacturer?: string | T.Manufacturer | null;
  brand?: T.DollBrand | T.DollBrand[] | null;
  articulation?: T.ArticulationType[];
  bodyVolume?: T.BodyVolume[];
  footType?: T.FootType[];
  releaseYear?: number | number[];
  gender?: T.Gender[];

  // Nested User-Specific Filters
  userFilters?: DollUsersFilters;
}

/**
 * Represents ownership-specific filters.
 * Field names are aligned with POST /dolls/filter request body.
 */
export interface DollUsersFilters {
  // Array of years as per Swagger example [0]
  acquisitionYear?: number[];

  // Property names must match backend expected keys
  purchaseState?: T.DollState[]; // Renamed from purchaseStates
  dollStatus?: T.DollStatus[]; // Renamed from status
  outfitState?: T.OutfitState[];

  // Boolean flags
  hasCouple?: boolean | null;
  hybrid?: boolean | null;

  // Additional fields if inherited from base Doll
  bodyVolume?: T.BodyVolume[];
  footType?: T.FootType[];
}
