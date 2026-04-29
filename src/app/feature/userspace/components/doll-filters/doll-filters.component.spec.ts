import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { DollFiltersComponent } from './doll-filters.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { DollService } from '../../../../core/services/dollService';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DollFiltersComponent', () => {
  let component: DollFiltersComponent;
  let fixture: ComponentFixture<DollFiltersComponent>;
  let dollServiceMock: jasmine.SpyObj<DollService>;
  let ownedDollServiceMock: jasmine.SpyObj<OwnedDollService>;
  let router: Router;

  beforeEach(async () => {
    dollServiceMock = jasmine.createSpyObj(
      'DollService',
      ['updateFilters', 'setRawFilters'],
      {
        isLoading: signal(false),
        filters: signal({ _page: 1, _limit: 12 }),
      },
    );

    ownedDollServiceMock = jasmine.createSpyObj(
      'OwnedDollService',
      ['loadShelf'],
      {
        isLoading: signal(false),
      },
    );

    await TestBed.configureTestingModule({
      imports: [DollFiltersComponent, NoopAnimationsModule],
      providers: [
        { provide: DollService, useValue: dollServiceMock },
        { provide: OwnedDollService, useValue: ownedDollServiceMock },
        provideRouter([]),
        provideAnimationsAsync('noop'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollFiltersComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  const asValue = <T>(val: T[]): T => val as unknown as T;

  /**
   * Tests shelf loading logic in userspace mode.
   */
  it('should call ownedDollService.loadShelf when in userspace', fakeAsync(() => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/shelf');
    fixture.detectChanges();

    expect(component.isUserspace()).toBeTrue();

    component.filterForm.patchValue({
      status: asValue(['active']),
      acquisitionYear: asValue([2026]),
      hasCouple: true,
    });

    component.onFilterChange();
    tick();

    expect(ownedDollServiceMock.loadShelf).toHaveBeenCalledWith(
      jasmine.objectContaining({
        filterCriteria: jasmine.objectContaining({
          status: ['active'],
          acquisitionYear: [2026],
          hasCouple: true,
        }),
      }),
      1,
    );
  }));

  /**
   * Tests shelf sorting mapping logic.
   */
  it('should correctly map shelf sort criteria', fakeAsync(() => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/shelf');
    fixture.detectChanges();

    component.filterForm.patchValue({
      sortData: { field: 'createdAt', order: 'ASC' },
    });

    component.onFilterChange();
    tick();

    const lastCall = ownedDollServiceMock.loadShelf.calls.mostRecent().args[0];
    expect(lastCall!.sortCriteria).toEqual({
      ownedDollSortBy: 'createdAt',
      ownedDollSortOrder: 'ASC',
    });
  }));

  /**
   * Tests full filter reset in userspace mode.
   */
  it('should reset filters and call loadShelf(null) when in userspace', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/shelf');
    fixture.detectChanges();

    component.filterForm.patchValue({
      hasCouple: true,
      gender: asValue(['Male']),
    });

    component.resetFilters();

    expect(component.filterForm.value.hasCouple).toBeFalse();
    expect(component.filterForm.value.gender).toBeNull();
    expect(ownedDollServiceMock.loadShelf).toHaveBeenCalledWith(null, 1);
  });

  /**
   * Tests full filter reset in catalog mode.
   */
  it('should reset filters and call setRawFilters when in catalog', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/catalog');
    fixture.detectChanges();

    component.resetFilters();

    expect(dollServiceMock.setRawFilters).toHaveBeenCalledWith({
      _page: 1,
      _limit: 12,
    });
  });

  /**
   * Tests internal utility for array conversion.
   */
  it('should handle undefined values in ensureArray correctly', () => {
    const result = component['ensureArray'](null);
    expect(result).toBeUndefined();

    // @ts-ignore
    const resultEmpty = component['ensureArray']('');
    expect(resultEmpty).toBeUndefined();

    // @ts-ignore
    const resultArr = component['ensureArray'](['test']);
    expect(resultArr).toEqual(['test']);

    const resultSingle = component['ensureArray']('test');
    expect(resultSingle).toEqual(['test']);
  });
});
