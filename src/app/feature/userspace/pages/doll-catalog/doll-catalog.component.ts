import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnDestroy,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { DollService } from '../../../../core/services/dollService';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-doll-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DollCardComponent,
    FilterPanelComponent,
  ],
  templateUrl: './doll-catalog.component.html',
  styleUrls: ['./doll-catalog.component.scss'],
  animations: [
    trigger('dropdown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: '*', overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
  ],
})
export class DollCatalogComponent implements OnInit, OnDestroy {
  protected ui = inject(UserspaceStateService);
  private readonly dollService = inject(DollService);
  private readonly route = inject(ActivatedRoute);
  private observer?: IntersectionObserver;
  private routeSub?: Subscription;

  @ViewChild('infiniteTrigger')
  public set infiniteTrigger(content: ElementRef | undefined) {
    if (content) {
      this.initInfiniteScroll(content);
    }
  }

  public get service(): DollService {
    return this.dollService;
  }

  constructor() {
    /**
     * Effect to update total dolls count in UI state.
     */
    effect(() => {
      this.ui.totalDolls.set(this.dollService.totalCount());
    });
  }

  ngOnInit(): void {
    /**
     * Manually subscribe to query params to trigger loading.
     * This avoids the circular dependency of the Signals effect.
     */
    this.routeSub = this.route.queryParams.subscribe((p) => {
      this.dollService.setRawFilters({
        manufacturer: p['manufacturer'] || null,
        brand: p['brand'] || null,
      });
    });
  }

  /**
   * Setup IntersectionObserver for infinite scrolling.
   * @param el - Trigger element.
   */
  private initInfiniteScroll(el: ElementRef): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !this.service.isLoading() &&
          this.service.hasMore()
        ) {
          this.service.loadMoreDolls();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );
    this.observer.observe(el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.routeSub?.unsubscribe();
  }
}
