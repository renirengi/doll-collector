import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollFiltersComponent } from './doll-filters.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { DollService } from '../../../../core/services/dollService';
import * as T from '../../../../shared/models/doll-enums';

class MockDollService {
  public updateFilters = jasmine.createSpy('updateFilters');
  public setRawFilters = jasmine.createSpy('setRawFilters');
  public isLoading = signal(false);
}

describe('DollFiltersComponent', () => {
  let component: DollFiltersComponent;
  let fixture: ComponentFixture<DollFiltersComponent>;
  let dollService: MockDollService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollFiltersComponent],
      providers: [
        { provide: DollService, useClass: MockDollService },
        provideRouter([]),
        provideAnimationsAsync('noop'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollFiltersComponent);
    component = fixture.componentInstance;
    dollService = TestBed.inject(DollService) as unknown as MockDollService;
    router = TestBed.inject(Router);
  });

  /**
   * Helper to satisfy the internal MatSelect multiple mode during tests.
   * Since form control types expect single values, we cast to unknown first.
   */
  const asValue = <T>(val: T[]): T => val as unknown as T;

  it('should include userFilters when in userspace', fakeAsync(() => {
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

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];

    expect(lastCall.userFilters).toBeDefined();
    expect(lastCall.userFilters.dollStatus).toEqual(['active']);
    expect(lastCall.userFilters.hasCouple).toBeTrue();
    expect(lastCall.userFilters.acquisitionYear).toEqual([2026]);
  }));

  it('should set hasCouple and hybrid to false by default in userFilters', fakeAsync(() => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/shelf');
    fixture.detectChanges();

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];

    expect(lastCall.userFilters.hasCouple).toBeFalse();
    expect(lastCall.userFilters.hybrid).toBeFalse();
  }));

  it('should call updateFilters with base filters correctly mapped to arrays', fakeAsync(() => {
    fixture.detectChanges();

    component.filterForm.patchValue({
      articulation: asValue(['FullyArticulated']),
      gender: asValue(['Female']),
    });

    component.onFilterChange();
    tick();

    expect(dollService.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        articulation: ['FullyArticulated'],
        gender: ['Female'],
      }),
    );
  }));

  it('should reset form to default values and arrays', () => {
    fixture.detectChanges();

    component.filterForm.patchValue({
      articulation: asValue(['Basic']),
      hasCouple: true,
    });

    component.resetFilters();

    // After reset, selection controls should be null or empty arrays
    // depending on your reset implementation. MatSelect expects [] or null.
    expect(component.filterForm.value.articulation).toBeNull();
    expect(component.filterForm.value.hasCouple).toBeFalse();
    expect(dollService.setRawFilters).toHaveBeenCalled();
  });

  it('should format sorting order in uppercase (ASC/DESC)', fakeAsync(() => {
    fixture.detectChanges();

    component.filterForm.patchValue({
      sortData: { field: 'releaseYear', order: 'DESC' },
    });

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];
    expect(lastCall._order).toBe('DESC');
    expect(lastCall._sort).toBe('releaseYear');
  }));

  it('should exclude userFilters when not in userspace', fakeAsync(() => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/catalog');
    fixture.detectChanges();

    expect(component.isUserspace()).toBeFalse();

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];
    expect(lastCall.userFilters).toBeUndefined();
  }));
});
