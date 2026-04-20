import {
  Component,
  inject,
  computed,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { dropdownAnimation } from '../../../../shared/animations';
import { createInfiniteScroll } from '../../../../shared/utils';

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
          <mat-spinner diameter="40" />
        }
      </div>
    </div>
  `,
})
export class UserShelfPage {
  protected readonly shelfService = inject(OwnedDollService);
  protected readonly ui = inject(UserspaceStateService);

  private readonly trigger = viewChild<ElementRef>('infiniteTrigger');

  private readonly canLoadMore = computed(
    () =>
      !this.shelfService.isLoading() &&
      this.shelfService.dolls().length < this.shelfService.totalCount(),
  );

  constructor() {
    createInfiniteScroll(this.trigger, {
      canLoad: this.canLoadMore,
      action: () => this.loadMore(),
    });

    if (this.shelfService.dolls().length === 0) {
      this.initialLoad();
    }
  }

  private initialLoad() {
    this.shelfService.loadShelf(this.shelfService.currentCriteria(), 1);
  }

  private loadMore() {
    const nextPage = this.shelfService.currentPage() + 1;
    this.shelfService.loadShelf(this.shelfService.currentCriteria(), nextPage);
  }
}
