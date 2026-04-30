import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-user-sold-doll-page',
  imports: [MatProgressSpinner, FilterPanelComponent],
  template: `@if (ui.isFilterOpen()) {
      <div class="filters-drawer-animation" [@dropdown]>
        <app-filter-panel />
      </div>
    }

    <div class="catalog-container sold min-h-screen">
      <header class="catalog-header">
        <h1>My sold doll</h1>
        <p>
          A gallery of past treasures. These pieces have moved on to new homes,
          leaving behind beautiful memories and making space for new chapters in
          my journey.
        </p>
      </header>

      <main class="catalog-content">
        <div class="initial-spinner">
          <mat-progress-spinner mode="indeterminate" />
        </div>

        <div class="doll-flex"></div>
      </main>
    </div>`,
  styleUrl: './user-sold-doll-page.scss',
})
export class UserSoldDollPage {
  protected readonly ui = inject(UserspaceStateService);
  private readonly route = inject(ActivatedRoute);

  private readonly trigger = viewChild<ElementRef>('infiniteTrigger');

  protected readonly params = toSignal(
    this.route.queryParams.pipe(tap((p: Params) => this.syncUrlFilters(p))),
  );
  private syncUrlFilters(p: Params): void {
    console.log(p); //ToDo when we get back
  }
}
