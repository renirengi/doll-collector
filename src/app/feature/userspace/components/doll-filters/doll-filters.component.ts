import { Component, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as T from '../../../../shared/models/doll-enums';
import { DollService } from '../../../../core/services/dollService';
import {
  DollCatalogFilters,
  DollUsersFilters,
} from '../../../../shared/models/doll-filters.model';

@Component({
  selector: 'app-doll-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIcon,
    MatDividerModule,
    MatCheckboxModule,
    TitleCasePipe,
  ],
  templateUrl: './doll-filters.component.html',
  styleUrls: ['./doll-filters.component.scss'],
})
export class DollFiltersComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  public readonly dollService = inject(DollService);

  public readonly isUserspace = computed(() =>
    this.router.url.includes('userspace'),
  );

  public readonly filterForm: FormGroup = this.fb.group({
    sortData: [null],
    articulation: [null],
    bodyVolume: [null],
    footType: [null],
    status: [null],
    purchaseStates: [null],
    outfitState: [null],
    hasCouple: [false],
    hybrid: [false],
    acquisitionYear: [null],
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
      articulation: raw.articulation ? [raw.articulation] : undefined,
      bodyVolume: raw.bodyVolume ? [raw.bodyVolume] : undefined,
      footType: raw.footType ? [raw.footType] : undefined,
      _sort: raw.sortData?.field || undefined,
      _order: raw.sortData?.order || undefined,
      userFilters: {} as DollUsersFilters,
    };

    if (this.isUserspace()) {
      filters.userFilters = {
        acquisitionYear: raw.acquisitionYear ? [raw.acquisitionYear] : [],
        bodyVolume: raw.bodyVolume ? [raw.bodyVolume] : undefined,
        footType: raw.footType ? [raw.footType] : undefined,
        purchaseStates: raw.purchaseStates ? [raw.purchaseStates] : undefined,
        status: raw.status ? [raw.status] : undefined,
        outfitState: raw.outfitState ? [raw.outfitState] : undefined,
        hasCouple: raw.hasCouple || null,
        hybrid: raw.hybrid || null,
      };
    }

    console.log('[Filters Component] Sending nested filters:', filters);
    this.dollService.updateFilters(filters);
  }

  public resetFilters(): void {
    this.filterForm.reset(
      { hasCouple: false, hybrid: false },
      { emitEvent: false },
    );
    this.filterForm.markAsPristine();
    this.dollService.setRawFilters({ _page: 1, _limit: 12 } as any);
  }
}
