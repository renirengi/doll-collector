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

  it('should include userFilters when in userspace', fakeAsync(() => {
    // Симулируем переход в userspace
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/collection');
    fixture.detectChanges();

    expect(component.isUserspace()).toBeTrue();

    // Заполняем форму
    component.filterForm.patchValue({
      status: 'active' as any,
      acquisitionYear: 2026,
      hasCouple: true,
    });

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];

    expect(lastCall.userFilters).toBeDefined();
    // ПРАВКА: теперь поле называется dollStatus, а не status
    expect(lastCall.userFilters.dollStatus).toEqual(['active']);
    expect(lastCall.userFilters.hasCouple).toBeTrue();
    // ПРАВКА: проверка года как массива [2026]
    expect(lastCall.userFilters.acquisitionYear).toEqual([2026]);
  }));

  it('should set hasCouple and hybrid to false by default in userFilters', fakeAsync(() => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/userspace/collection');
    fixture.detectChanges();

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];

    expect(lastCall.userFilters.hasCouple).toBeFalse();
    expect(lastCall.userFilters.hybrid).toBeFalse();
  }));

  it('should call updateFilters with base filters', fakeAsync(() => {
    fixture.detectChanges();

    component.filterForm.patchValue({
      articulation: 'FullyArticulated' as any,
    });

    component.onFilterChange();
    tick();

    expect(dollService.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        articulation: ['FullyArticulated'],
      }),
    );
  }));

  it('should reset form to default values', () => {
    fixture.detectChanges();
    component.filterForm.patchValue({
      articulation: 'Basic' as any,
      hasCouple: true,
    });

    component.resetFilters();

    expect(component.filterForm.value.articulation).toBeNull();
    expect(component.filterForm.value.hasCouple).toBeFalse();
    expect(dollService.setRawFilters).toHaveBeenCalled();
  });

  it('should format sorting order in uppercase (ASC/DESC)', fakeAsync(() => {
    fixture.detectChanges();

    component.filterForm.patchValue({
      sortData: { field: 'releaseYear', order: 'DESC' } as any
    });

    component.onFilterChange();
    tick();

    const lastCall = dollService.updateFilters.calls.mostRecent().args[0];
    expect(lastCall._order).toBe('DESC');
  }));
});
