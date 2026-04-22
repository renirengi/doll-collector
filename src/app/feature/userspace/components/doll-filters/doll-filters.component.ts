import { Component, inject, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as T from '../../../../shared/models/doll-enums';
import { DollService } from '../../../../core/services/dollService';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import {
  DollCatalogFilters,
  FilterForm,
} from '../../../../shared/models/doll-filters.model';
import { DollSelectComponent } from '../doll-select/doll-select.component';
import { FILTERS_CONFIGS } from '../../../../shared/constants';
import {
  OwnedDollSortAndFilterDto,
  OwnedDollSortCriteria,
  OwnedDollFilterCriteria,
} from '../../../../shared/models';

type FilterFormData = ReturnType<FormGroup<FilterForm>['getRawValue']>;

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
  protected readonly dollService = inject(DollService);
  private readonly ownedDollService = inject(OwnedDollService);

  public readonly filterConfigs = FILTERS_CONFIGS;

  public readonly isUserspace = computed(
    (): boolean =>
      this.router.url.includes('shelf') ||
      this.router.url.includes('userspace'),
  );

  public readonly filterForm = new FormGroup<FilterForm>({
    sortData: new FormControl(null),
    articulation: new FormControl(null),
    bodyVolume: new FormControl(null),
    footType: new FormControl(null),
    gender: new FormControl(null),
    status: new FormControl(null),
    purchaseStates: new FormControl(null),
    outfitState: new FormControl(null),
    hasCouple: new FormControl(false),
    hybrid: new FormControl(false),
    acquisitionYear: new FormControl(null),
  });

  public onFilterChange(): void {
    const raw: FilterFormData = this.filterForm.getRawValue();

    if (this.isUserspace()) {
      this.ownedDollService.loadShelf(this.mapToShelfCriteria(raw), 1);
      return;
    }

    this.dollService.updateFilters(this.mapToCatalogFilters(raw));
  }

  public resetFilters(): void {
    this.filterForm.reset({
      hasCouple: false,
      hybrid: false,
      sortData: null,
      gender: null,
    });
    this.filterForm.markAsPristine();

    if (this.isUserspace()) {
      this.ownedDollService.loadShelf(null, 1);
      return;
    }

    this.dollService.setRawFilters({ _page: 1, _limit: 12 });
  }

  private mapToShelfCriteria(raw: FilterFormData): OwnedDollSortAndFilterDto {
    const baseFields = {
      articulation: this.ensureArray(raw.articulation),
      bodyVolume: this.ensureArray(raw.bodyVolume),
      footType: this.ensureArray(raw.footType),
      gender: this.ensureArray(raw.gender),
    };

    // Only include 'base' if at least one field is defined
    const hasBase = Object.values(baseFields).some((v) => v !== undefined);

    const filterCriteria: OwnedDollFilterCriteria = {
      base: hasBase ? baseFields : undefined,
      purchaseState: this.ensureArray(raw.purchaseStates),
      status: this.ensureArray(raw.status),
      outfitState: this.ensureArray(raw.outfitState),
      acquisitionYear: this.ensureArray(raw.acquisitionYear),
      hasCouple: raw.hasCouple || undefined,
      hybrid: raw.hybrid || undefined,
    };

    return {
      filterCriteria,
      sortCriteria: this.getShelfSort(raw.sortData?.field, raw.sortData?.order),
    };
  }

  private getShelfSort(
    field?: string,
    order?: 'ASC' | 'DESC',
  ): OwnedDollSortCriteria {
    const validFields: Array<OwnedDollSortCriteria['ownedDollSortBy']> = [
      'soldPrice',
      'acquisitionYear',
      'createdAt',
      'name',
    ];

    return {
      ownedDollSortBy: validFields.includes(field as any)
        ? (field as OwnedDollSortCriteria['ownedDollSortBy'])
        : 'createdAt',
      ownedDollSortOrder: order ?? 'DESC',
    };
  }

  private mapToCatalogFilters(raw: FilterFormData): DollCatalogFilters {
    return {
      _page: 1,
      _limit: 12,
      articulation: this.ensureArray(raw.articulation),
      bodyVolume: this.ensureArray(raw.bodyVolume),
      footType: this.ensureArray(raw.footType),
      gender: this.ensureArray(raw.gender),
      _sort: raw.sortData?.field,
      _order: raw.sortData?.order,
    };
  }

  private ensureArray<T>(value: T | T[] | null | undefined): T[] | undefined {
    if (!value || (value as unknown) === '') {
      return undefined;
    }
    return Array.isArray(value) ? value : [value];
  }
}
