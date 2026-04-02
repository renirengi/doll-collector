import { Component, inject, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as T from '../../../../shared/models/doll-enums';
import { DollService } from '../../../../core/services/dollService';
import { DollCatalogFilters } from '../../../../shared/models/doll-filters.model';
import { DollSelectComponent } from '../doll-select/doll-select.component';

interface FilterForm {
  sortData: FormControl<{
    field: 'releaseYear' | 'soldPrice' | 'acquisitionYear' | 'createdAt';
    order: 'ASC' | 'DESC';
  } | null>;
  articulation: FormControl<T.ArticulationType | null>;
  bodyVolume: FormControl<T.BodyVolume | null>;
  footType: FormControl<T.FootType | null>;
  status: FormControl<T.DollStatus | null>;
  purchaseStates: FormControl<T.DollState | null>;
  outfitState: FormControl<T.OutfitState | null>;
  hasCouple: FormControl<boolean | null>;
  hybrid: FormControl<boolean | null>;
  acquisitionYear: FormControl<number | null>;
}

@Component({
  selector: 'app-doll-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    DollSelectComponent,
  ],
  templateUrl: './doll-filters.component.html',
})
export class DollFiltersComponent {
  private readonly router = inject(Router);
  public readonly dollService = inject(DollService);

  public readonly isUserspace = computed(
    () =>
      this.router.url.includes('shelf') ||
      this.router.url.includes('userspace'),
  );

  public readonly filterForm = new FormGroup<FilterForm>({
    sortData: new FormControl(null),
    articulation: new FormControl(null),
    bodyVolume: new FormControl(null),
    footType: new FormControl(null),
    status: new FormControl(null),
    purchaseStates: new FormControl(null),
    outfitState: new FormControl(null),
    hasCouple: new FormControl(false),
    hybrid: new FormControl(false),
    acquisitionYear: new FormControl(null),
  });

  public readonly filterConfigs = [
    {
      label: 'Sort Results',
      ctrl: 'sortData',
      options: null,
      isSort: true,
      alwaysShow: true,
    },
    {
      label: 'Articulation',
      ctrl: 'articulation',
      options: [
        'Basic',
        'LegsArticulated',
        'ArmsArticulated',
        'FullyArticulated',
        'SuperArticulated',
        'Other',
      ],
      alwaysShow: true,
    },
    {
      label: 'Body Type',
      ctrl: 'bodyVolume',
      options: ['Standard', 'Tall', 'Petite', 'Curvy', 'SuperCurvy', 'Other'],
      alwaysShow: true,
    },
    {
      label: 'Foot Type',
      ctrl: 'footType',
      options: [
        'Flat Standard',
        'Flat Non-Standard',
        'Heeled',
        'Small Heeled',
        'Universal',
      ],
      alwaysShow: true,
    },
    {
      label: 'Status',
      ctrl: 'status',
      options: ['active', 'sold', 'gifted'],
      alwaysShow: false,
    },
    {
      label: 'Condition',
      ctrl: 'purchaseStates',
      options: ['New', 'Used-Collector', 'Used-Child'],
      alwaysShow: false,
    },
    {
      label: 'Outfit',
      ctrl: 'outfitState',
      options: ['original', 'nude', 'custom'],
      alwaysShow: false,
    },
  ];

  public onFilterChange(): void {
    const raw = this.filterForm.getRawValue();
    const filters: DollCatalogFilters = {
      _page: 1,
      _limit: 12,
      articulation: raw.articulation ? [raw.articulation] : undefined,
      bodyVolume: raw.bodyVolume ? [raw.bodyVolume] : undefined,
      footType: raw.footType ? [raw.footType] : undefined,
      _sort: raw.sortData?.field,
      _order: raw.sortData?.order,
    };

    if (this.isUserspace()) {
      filters.userFilters = {
        acquisitionYear: raw.acquisitionYear
          ? [raw.acquisitionYear]
          : undefined,
        purchaseState: raw.purchaseStates ? [raw.purchaseStates] : undefined,
        dollStatus: raw.status ? [raw.status] : undefined,
        outfitState: raw.outfitState ? [raw.outfitState] : undefined,
        hasCouple: raw.hasCouple ?? null,
        hybrid: raw.hybrid ?? null,
      };
    }
    this.dollService.updateFilters(filters);
  }

  public resetFilters(): void {
    this.filterForm.reset({ hasCouple: false, hybrid: false, sortData: null });
    this.filterForm.markAsPristine();
    this.dollService.setRawFilters({ _page: 1, _limit: 12 });
  }
}
