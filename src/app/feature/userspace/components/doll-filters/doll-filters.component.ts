import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import * as T from '../../../../shared/models/doll-enums';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { effect } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DollService } from '../../../../core/services/dollService';
import { DollFilters } from '../../../../shared/models/doll-filters.model';

interface SortData {
  field: 'price' | 'releaseYear' | 'acquisitionYear';
  order: 'asc' | 'desc';
}

interface FilterFormValue {
  sortData: SortData | null;
  articulation: T.ArticulationType[];
  bodyVolume: T.BodyVolume[];
  footType: T.FootType[];
  purchaseStates: T.DollState[];
  status: T.DollStatus[];
}

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
    TitleCasePipe,
  ],
  templateUrl: './doll-filters.component.html',
  styleUrls: ['./doll-filters.component.scss'],
})
export class DollFiltersComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly dollService: DollService = inject(DollService);

  public readonly filterForm: FormGroup = this.fb.group({
    sortData: [null],
    articulation: [[]],
    bodyVolume: [[]],
    footType: [[]],
    purchaseStates: [[]],
    status: [[]],
  });

  public readonly articulationOptions: T.ArticulationType[] = [
    'Basic',
    'LegsArticulated',
    'ArmsArticulated',
    'FullyArticulated',
    'SuperArticulated',
  ];
  public readonly bodyOptions: T.BodyVolume[] = [
    'Standard',
    'Tall',
    'Petite',
    'Curvy',
    'SuperCurvy',
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

  private readonly formValue = toSignal<FilterFormValue>(
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
      ),
    ),
  );

  constructor() {
    effect(() => {
      const value = this.formValue();
      if (value) {
        this.applyFilters(value);
      }
    });
  }

  private applyFilters(value: FilterFormValue): void {
    const filters: Partial<DollFilters> = {
      articulation: value.articulation,
      bodyVolume: value.bodyVolume,
      footType: value.footType,
      purchaseStates: value.purchaseStates,
      status: value.status,
      _sort: value.sortData?.field,
      _order: value.sortData?.order,
    };

    this.dollService.updateFilters(filters);
  }

  public resetFilters(): void {
    this.filterForm.reset({
      sortData: null,
      articulation: [],
      bodyVolume: [],
      footType: [],
      purchaseStates: [],
      status: [],
    });
  }
}
