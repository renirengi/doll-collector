import { Component, inject, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as T from '../../../../shared/models/doll-enums';
import { DollService } from '../../../../core/services/dollService';
import {
  DollCatalogFilters,
  DollUsersFilters,
} from '../../../../shared/models/doll-filters.model';

interface FilterForm {
  sortData: FormControl<{
    field: 'price' | 'releaseYear' | 'acquisitionYear';
    order: 'asc' | 'desc';
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
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatCheckboxModule,
    TitleCasePipe,
  ],
  templateUrl: './doll-filters.component.html',
  styleUrls: ['./doll-filters.component.scss'],
})
export class DollFiltersComponent {
  private readonly router = inject(Router);
  public readonly dollService = inject(DollService);

  public readonly isUserspace = computed(() =>
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

  public readonly articulationOptions: T.ArticulationType[] = [
    'Basic',
    'LegsArticulated',
    'ArmsArticulated',
    'FullyArticulated',
    'SuperArticulated',
    'Other',
  ];
  public readonly bodyOptions: T.BodyVolume[] = [
    'Standard',
    'Tall',
    'Petite',
    'Curvy',
    'SuperCurvy',
    'Other',
  ];
  public readonly footOptions: T.FootType[] = [
    'Flat Standard',
    'Flat Non-Standard',
    'Heeled',
    'Small Heeled',
    'Universal',
  ];
  public readonly stateOptions: T.DollState[] = [
    'New',
    'Used-Collector',
    'Used-Child',
  ];
  public readonly statusOptions: T.DollStatus[] = ['active', 'sold', 'gifted'];
  public readonly outfitOptions: T.OutfitState[] = [
    'original',
    'nude',
    'custom',
  ];

  public onFilterChange(): void {
    const raw = this.filterForm.getRawValue();

    const filters: DollCatalogFilters = {
      _page: 1,
      _limit: 12,
      articulation: raw.articulation ? [raw.articulation] : undefined,
      bodyVolume: raw.bodyVolume ? [raw.bodyVolume] : undefined,
      footType: raw.footType ? [raw.footType] : undefined,
      _sort: raw.sortData?.field ?? undefined,
      _order: raw.sortData?.order ?? undefined,
    };

    if (this.isUserspace()) {
      const userFilters: DollUsersFilters = {
        acquisitionYear: raw.acquisitionYear ? [raw.acquisitionYear] : [],
        purchaseStates: raw.purchaseStates ? [raw.purchaseStates] : undefined,
        status: raw.status ? [raw.status] : undefined,
        outfitState: raw.outfitState ? [raw.outfitState] : undefined,
        hasCouple: raw.hasCouple ?? null,
        hybrid: raw.hybrid ?? null,
      };
      filters.userFilters = userFilters;
    }

    this.dollService.updateFilters(filters);
  }

  public resetFilters(): void {
    this.filterForm.reset({
      hasCouple: false,
      hybrid: false,
    });

    this.filterForm.markAsPristine();

    const initialFilters: DollCatalogFilters = {
      _page: 1,
      _limit: 12,
    };

    this.dollService.setRawFilters(initialFilters);
  }
}
