import { Component, inject, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as T from '../../../../shared/models/doll-enums';
import { DollService } from '../../../../core/services/dollService';
import {
  DollCatalogFilters,
  FilterForm,
} from '../../../../shared/models/doll-filters.model';
import { DollSelectComponent } from '../doll-select/doll-select.component';
import { FILTERS_CONFIGS } from '../../../../shared/constants';

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
    gender: new FormControl(null), // Initialized gender control
    status: new FormControl(null),
    purchaseStates: new FormControl(null),
    outfitState: new FormControl(null),
    hasCouple: new FormControl(false),
    hybrid: new FormControl(false),
    acquisitionYear: new FormControl(null),
  });

  public readonly filterConfigs = FILTERS_CONFIGS;

  /**
   * Normalizes values to arrays for the backend, while handling potential
   * mixed input types from the form controls.
   */
  private ensureArray<T>(value: T | T[] | null | undefined): T[] | undefined {
    if (value === null || value === undefined || (value as unknown) === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  }

  public onFilterChange(): void {
    const raw = this.filterForm.getRawValue();

    const filters: DollCatalogFilters = {
      _page: 1,
      _limit: 12,
      articulation: this.ensureArray(raw.articulation),
      bodyVolume: this.ensureArray(raw.bodyVolume),
      footType: this.ensureArray(raw.footType),
      gender: this.ensureArray(raw.gender),
      _sort: raw.sortData?.field,
      _order: raw.sortData?.order,
    };

    if (this.isUserspace()) {
      filters.userFilters = {
        acquisitionYear: this.ensureArray(raw.acquisitionYear) as
          | number[]
          | undefined,
        purchaseState: this.ensureArray(raw.purchaseStates) as
          | T.DollState[]
          | undefined,
        dollStatus: this.ensureArray(raw.status) as T.DollStatus[] | undefined,
        outfitState: this.ensureArray(raw.outfitState) as
          | T.OutfitState[]
          | undefined,
        hasCouple: raw.hasCouple ?? null,
        hybrid: raw.hybrid ?? null,
      };
    }
    this.dollService.updateFilters(filters);
  }

  public resetFilters(): void {
    // Resetting to empty arrays for multi-select compatibility
    this.filterForm.reset({
      hasCouple: false,
      hybrid: false,
      sortData: null,
      gender: null,
    });
    this.filterForm.markAsPristine();
    this.dollService.setRawFilters({ _page: 1, _limit: 12 });
  }
}
