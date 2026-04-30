import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { ActivatedRoute, Params } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'app-user-shop-page',
  imports: [MatProgressSpinner, FilterPanelComponent],
  template: `@if (ui.isFilterOpen()) {
      <div class="filters-drawer-animation" [@dropdown]>
        <app-filter-panel />
      </div>
    }

    <div class="catalog-container shop min-h-screen">
      <header class="catalog-header">
        <h1>My shop</h1>
        <p>
          A collection of hearts and dreams. These are the pieces that speak
          loudest to my soul, capturing the essence of what I love most in the
          world of dolls.
        </p>
      </header>

      <main class="catalog-content">
        <div class="initial-spinner">
          <mat-progress-spinner mode="indeterminate" />
        </div>

        <div class="doll-flex"></div>
      </main>
    </div>`,
  styleUrl: './user-shop-page.scss',
})
export class UserShopPage {
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
