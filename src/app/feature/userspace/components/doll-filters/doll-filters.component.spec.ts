import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollFiltersComponent } from './doll-filters.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';
import { DollService } from '../../../../core/services/dollService';

class MockDollService {
  public updateFilters = jasmine.createSpy('updateFilters');
  public isLoading = signal(false);
}

describe('DollFiltersComponent', () => {
  let component: DollFiltersComponent;
  let fixture: ComponentFixture<DollFiltersComponent>;
  let dollService: MockDollService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollFiltersComponent],
      providers: [
        { provide: DollService, useClass: MockDollService },
        provideAnimationsAsync('noop'),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollFiltersComponent);
    component = fixture.componentInstance;
    dollService = TestBed.inject(DollService) as unknown as MockDollService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateFilters when form changes after debounce', fakeAsync(() => {
    component.filterForm.patchValue({
      articulation: ['FullyArticulated'],
      sortData: { field: 'price', order: 'asc' },
    });

    tick(400);
    fixture.detectChanges();

    expect(dollService.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        articulation: ['FullyArticulated'],
        _sort: 'price',
        _order: 'asc',
      }),
    );
  }));

  it('should not call updateFilters if values are same (distinctUntilChanged)', fakeAsync(() => {
    component.filterForm.patchValue({ status: ['active'] });
    tick(400);
    fixture.detectChanges();
    dollService.updateFilters.calls.reset();

    component.filterForm.patchValue({ status: ['active'] });
    tick(400);
    fixture.detectChanges();

    expect(dollService.updateFilters).not.toHaveBeenCalled();
  }));

  it('should reset form and call updateFilters with empty values', fakeAsync(() => {
    component.filterForm.patchValue({ status: ['sold'] });
    tick(400);
    fixture.detectChanges();
    dollService.updateFilters.calls.reset();

    component.resetFilters();
    tick(400);
    fixture.detectChanges();

    expect(component.filterForm.pristine).toBeTrue();
    expect(dollService.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        status: [],
      }),
    );
  }));

  it('should disable reset button when form is pristine', () => {
    const resetButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="button"]',
    );
    expect(resetButton.disabled).toBeTrue();

    component.filterForm.markAsDirty();
    fixture.detectChanges();

    expect(resetButton.disabled).toBeFalse();
  });
});
