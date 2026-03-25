import * as T from './doll-enums';
import { Hybrid } from './doll.model';

export interface DollCatalogFilters {
  // Pagination
  _page?: number;
  _limit?: number;

  // Sorting
  _sort?: 'price' | 'releaseYear' | 'acquisitionYear';
  _order?: 'asc' | 'desc';

  // Context fields (from URL or navigation)
  manufacturer?: string | T.Manufacturer | null;

  // Multi-select or single value from URL
  brand?: T.DollBrand | T.DollBrand[] | null;

  // Multi-select filters
  articulation?: T.ArticulationType[];
  bodyVolume?: T.BodyVolume[];
  footType?: T.FootType[];

  // Optional filters
  releaseYear?: number | number[];
  gender?: T.Gender[];

  userFilters?: DollUsersFilters;
}

export interface DollUsersFilters {
  acquisitionYear: number | number[];
  bodyVolume?: T.BodyVolume[];
  footType?: T.FootType[];
  purchaseStates?: T.DollState[];
  status?: T.DollStatus[];

  hasCouple?: boolean | null;

  outfitState?: T.OutfitState[];
  hybrid?: boolean | null;
}
