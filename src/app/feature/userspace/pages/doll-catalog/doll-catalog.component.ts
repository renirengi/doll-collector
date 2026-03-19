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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DollCardComponent } from '../../components/doll-card/doll-card.component';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
export class DollCatalogComponent implements OnDestroy {
  protected ui = inject(UserspaceStateService);
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

  constructor() {
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const manufacturer = params['manufacturer'] || null;
      const brand = params['brand'] || null;

      this.dollService.setRawFilters({
        manufacturer,
        brand,
        _page: 1,
        _limit: 12,
      });
    });
  }

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

  public loadNextBatch(): void {
    this.dollService.loadMoreDolls();
  }

  public ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
