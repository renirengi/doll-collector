import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnDestroy,
  OnInit,
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

  @ViewChild('infiniteTrigger')
  public set infiniteTrigger(content: ElementRef | undefined) {
    if (content) {
      this.initInfiniteScroll(content);
    }
  }

  public get service(): DollService {
    return this.dollService;
  }

  ngOnInit(): void {
    this.routeSub = this.route.queryParams
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      )
      .subscribe((p: Params) => {
        console.log('[Catalog] Route Params changed:', p);
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
        const canLoad =
          entry.isIntersecting &&
          !this.service.isLoading() &&
          this.service.hasMore();

        if (canLoad) {
          console.log(
            '[Catalog] Infinite Scroll Triggered. Loading next page...',
          );
          this.service.loadMoreDolls();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '100px', // Slightly reduced to prevent over-eager loading
      },
    );
    this.observer.observe(el.nativeElement);
  }

  ngOnDestroy(): void {
    console.log(
      '[Catalog] Destroying component, cleaning up observer and subs.',
    );
    this.observer?.disconnect();
    this.routeSub?.unsubscribe();
  }
}
