import * as T from '../models';

export interface FilterFieldConfig {
  name: string;
  label: string;
  options: any[];
  translate?: boolean;
}

export const BASE_DOLL_FILTERS: FilterFieldConfig[] = [
  {
    name: 'articulation',
    label: 'Articulation',
    options: [
      'Basic',
      'LegsArticulated',
      'ArmsArticulated',
      'FullyArticulated',
      'SuperArticulated',
      'Other',
    ] as T.ArticulationType[],
  },
  {
    name: 'bodyVolume',
    label: 'Body Volume',
    options: [
      'Standard',
      'Tall',
      'Petite',
      'Curvy',
      'SuperCurvy',
      'Other',
    ] as T.BodyVolume[],
  },
  {
    name: 'footType',
    label: 'Foot Type',
    options: [
      'Flat Standard',
      'Flat Non-Standard',
      'Heeled',
      'Small Heeled',
      'Universal',
    ] as T.FootType[],
  },
];

export const USER_SHELF_FILTERS: FilterFieldConfig[] = [
  {
    name: 'status',
    label: 'Status',
    options: ['active', 'sold', 'gifted'] as T.DollStatus[],
    translate: true,
  },
  {
    name: 'purchaseStates',
    label: 'Purchase State',
    options: ['New', 'Used-Collector', 'Used-Child'] as T.DollState[],
  },
  {
    name: 'outfitState',
    label: 'Outfit State',
    options: ['original', 'nude', 'custom'] as T.OutfitState[],
    translate: true,
  },
];

export const SORT_OPTIONS = [
  {
    label: 'Year Released (Newest)',
    value: { field: 'releaseYear', order: 'DESC' },
  },
  {
    label: 'Year Released (Oldest)',
    value: { field: 'releaseYear', order: 'ASC' },
  },
  {
    label: 'Price (High to Low)',
    value: { field: 'soldPrice', order: 'DESC' },
  },
  { label: 'Price (Low to High)', value: { field: 'soldPrice', order: 'ASC' } },
  {
    label: 'Acquisition Year',
    value: { field: 'acquisitionYear', order: 'DESC' },
  },
  { label: 'Date Added', value: { field: 'createdAt', order: 'DESC' } },
];
