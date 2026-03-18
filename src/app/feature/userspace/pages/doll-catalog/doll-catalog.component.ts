import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DollService } from '../../../../core/services/dollService';
import { ManufacturerNavigationComponent } from '../../components/manufacturer-navigation/manufacturer-navigation.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { DollFiltersComponent } from '../../components/doll-filters/doll-filters.component';

@Component({
  selector: 'app-doll-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    DollCardComponent,
    DollFiltersComponent,
    ManufacturerNavigationComponent,
  ],
  templateUrl: './doll-catalog.component.html',
  styleUrls: ['./doll-catalog.component.scss'],
})
export class DollCatalogComponent implements OnDestroy {
  private readonly dollService = inject(DollService);
  private readonly route = inject(ActivatedRoute);
  private observer?: IntersectionObserver;

  @ViewChild('infiniteTrigger')
  public set infiniteTrigger(content: ElementRef | undefined) {
    if (content) {
      this.initInfiniteScroll(content);
    }
  }

  public get service(): DollService {
    return this.dollService;
  }

  /**
   * Subscribes to route parameters to update filters based on manufacturer and brand from URL.
   */
  constructor() {
    this.route.params.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.dollService.setRawFilters({
        manufacturer: params['manufacturer'] || null,
        brand: params['brand'] || null,
        _page: 1,
        _limit: 12,
      });
    });
  }

  /**
   * Configures the IntersectionObserver for infinite scrolling.
   * @param el The ElementRef acting as a trigger at the bottom of the list.
   */
  private initInfiniteScroll(el: ElementRef): void {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (
          entries[0].isIntersecting &&
          !this.dollService.isLoading() &&
          this.dollService.hasMore()
        ) {
          this.loadNextBatch();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      },
    );

    this.observer.observe(el.nativeElement);
  }

  /**
   * Triggers loading of the next batch of dolls via the service.
   */
  public loadNextBatch(): void {
    this.dollService.loadMoreDolls();
  }

  /**
   * Cleanup: disconnects the observer to prevent memory leaks.
   */
  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
