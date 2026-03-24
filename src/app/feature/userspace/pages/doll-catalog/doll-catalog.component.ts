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
import { ActivatedRoute, Params } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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

  /**
   * Setter for the infinite scroll trigger element.
   * Re-initializes the observer whenever the trigger element is rendered.
   */
  @ViewChild('infiniteTrigger')
  public set infiniteTrigger(content: ElementRef | undefined) {
    if (content) {
      this.initInfiniteScroll(content);
    }
  }

  /**
   * Getter to access DollService in the template.
   */
  public get service(): DollService {
    return this.dollService;
  }

  constructor() {
    /**
     * Effect to update the global total dolls count signal.
     */
    effect(() => {
      this.ui.totalDolls.set(this.dollService.totalCount());
    });
  }

  ngOnInit(): void {
    /**
     * Subscribe to query parameters changes.
     * distinctUntilChanged is used to prevent redundant loads if params haven't actually changed.
     */
    this.routeSub = this.route.queryParams
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      )
      .subscribe((p: Params) => {
        this.dollService.setRawFilters({
          manufacturer: p['manufacturer'] || null,
          brand: p['brand'] || null,
        });
      });
  }

  /**
   * Initializes the IntersectionObserver for infinite scrolling logic.
   * @param el - The element acting as a scroll trigger.
   */
  private initInfiniteScroll(el: ElementRef): void {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      ([entry]) => {
        /**
         * Trigger loading more data only if the element is visible,
         * no current loading is in progress, and there are more items to fetch.
         */
        if (
          entry.isIntersecting &&
          !this.service.isLoading() &&
          this.service.hasMore()
        ) {
          this.service.loadMoreDolls();
        }
      },
      {
        threshold: 0,
        rootMargin: '200px', // Pre-load content 200px before it enters the viewport
      },
    );
    this.observer.observe(el.nativeElement);
  }

  /**
   * Cleanup on component destruction to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.routeSub?.unsubscribe();
  }
}
