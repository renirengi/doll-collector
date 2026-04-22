import {
  Component,
  inject,
  computed,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { dropdownAnimation } from '../../../../shared/animations';
import { createInfiniteScroll } from '../../../../shared/utils';
import { OwnedDollSortAndFilterDto } from '../../../../shared/models';
import * as T from '../../../../shared/models/doll-enums';

@Component({
  selector: 'app-user-shelf-page',
  standalone: true,
  imports: [
    CommonModule,
    DollCardComponent,
    FilterPanelComponent,
    MatProgressSpinnerModule,
  ],
  animations: [dropdownAnimation],
  template: `
    <div class="shelf-page">
      @if (ui.isFilterOpen()) {
        <div [@dropdown]><app-filter-panel /></div>
      }

      <div class="dolls-grid">
        @for (doll of shelfService.dolls(); track doll.id) {
          <app-doll-card [doll]="doll" />
        }
      </div>

      <div #infiniteTrigger class="scroll-anchor">
        @if (shelfService.isLoading()) {
          <div class="flex justify-center p-4">
            <mat-spinner diameter="40" />
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './user-shelf-page.scss',
})
export class UserShelfPage {
  protected readonly shelfService = inject(OwnedDollService);
  protected readonly ui = inject(UserspaceStateService);
  private readonly route = inject(ActivatedRoute);

  private readonly trigger = viewChild<ElementRef>('infiniteTrigger');

  protected readonly params = toSignal(
    this.route.queryParams.pipe(tap((p: Params) => this.syncUrlFilters(p))),
  );

  protected readonly canLoadMore = computed(
    (): boolean =>
      !this.shelfService.isLoading() &&
      this.shelfService.dolls().length < this.shelfService.totalCount(),
  );

  constructor() {
    createInfiniteScroll(this.trigger, {
      canLoad: this.canLoadMore,
      action: (): void => this.loadMore(),
    });
  }

  private syncUrlFilters(p: Params): void {
    const manufacturers = this.mapParam<T.Manufacturer>(p['manufacturer']);
    const brands = this.mapParam<T.DollBrand>(p['brand']);

    const current = this.shelfService.currentCriteria();

    const updatedCriteria: OwnedDollSortAndFilterDto = {
      sortCriteria: current?.sortCriteria ?? {
        ownedDollSortBy: 'createdAt',
        ownedDollSortOrder: 'DESC',
      },
      filterCriteria: {
        ...current?.filterCriteria,
        base: {
          ...current?.filterCriteria?.base,
          manufacturer: manufacturers ?? undefined,
          brand: brands ?? undefined,
        },
      },
    };

    this.shelfService.loadShelf(updatedCriteria, 1);
  }

  private loadMore(): void {
    const nextPage = this.shelfService.currentPage() + 1;
    this.shelfService.loadShelf(this.shelfService.currentCriteria(), nextPage);
  }

  private mapParam<T>(value: unknown): T[] | null {
    if (!value) return null;
    const array = Array.isArray(value) ? value : [String(value)];
    return array as T[];
  }
}
