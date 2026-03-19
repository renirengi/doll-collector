import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollCatalogComponent } from './doll-catalog.component';
import { DollService } from '../../../../core/services/dollService';
import { provideRouter, Router } from '@angular/router';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DollCatalogComponent', () => {
  let component: DollCatalogComponent;
  let fixture: ComponentFixture<DollCatalogComponent>;
  let dollServiceSpy: jasmine.SpyObj<DollService>;
  let uiService: UserspaceStateService;
  let router: Router;

  const totalCountSignal = signal(0);
  const isLoadingSignal = signal(false);
  const hasMoreSignal = signal(true);
  const dollsSignal = signal<any[]>([]);

  beforeEach(async () => {
    const spy = jasmine.createSpyObj(
      'DollService',
      ['setRawFilters', 'loadMoreDolls'],
      {
        totalCount: totalCountSignal,
        isLoading: isLoadingSignal,
        hasMore: hasMoreSignal,
        dolls: dollsSignal,
      },
    );

    await TestBed.configureTestingModule({
      imports: [DollCatalogComponent, NoopAnimationsModule],
      providers: [
        { provide: DollService, useValue: spy },
        UserspaceStateService,
        provideRouter([{ path: 'catalog', component: DollCatalogComponent }]),
      ],
    }).compileComponents();

    dollServiceSpy = TestBed.inject(DollService) as jasmine.SpyObj<DollService>;
    uiService = TestBed.inject(UserspaceStateService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(DollCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update filters when query params change', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    router.navigate(['/catalog'], {
      queryParams: { manufacturer: 'Kurhn', brand: 'Kurhn-brand' },
    });

    tick();
    fixture.detectChanges();
    tick();

    expect(dollServiceSpy.setRawFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        manufacturer: 'Kurhn',
        brand: 'Kurhn-brand',
        _page: 1,
      }),
    );
  }));

  it('should synchronize totalCount with UserspaceStateService via effect', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    totalCountSignal.set(150);

    fixture.detectChanges();
    tick();

    expect(uiService.totalDolls()).toBe(150);
  }));

  it('should call loadNextBatch when infinite scroll triggers', () => {
    spyOn(component, 'loadNextBatch').and.callThrough();

    component.loadNextBatch();

    expect(dollServiceSpy.loadMoreDolls).toHaveBeenCalled();
  });
});
