import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollCatalogComponent } from './doll-catalog.component';
import { DollService } from '../../../../core/services/dollService';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DollCatalogComponent', () => {
  let component: DollCatalogComponent;
  let fixture: ComponentFixture<DollCatalogComponent>;
  let dollServiceMock: jasmine.SpyObj<DollService>;
  let uiServiceMock: jasmine.SpyObj<UserspaceStateService>;
  const queryParamsSubject = new BehaviorSubject<Record<string, any>>({});

  beforeEach(async () => {
    dollServiceMock = jasmine.createSpyObj(
      'DollService',
      ['updateFilters', 'loadMoreDolls'],
      {
        dolls: signal([]),
        isLoading: signal(false),
        hasMore: signal(true),
        filters: signal({ _page: 1, _limit: 12 }),
      },
    );

    uiServiceMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
      totalDolls: signal(0),
    });

    await TestBed.configureTestingModule({
      imports: [DollCatalogComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { queryParams: queryParamsSubject.asObservable() },
        },
        { provide: DollService, useValue: dollServiceMock },
        { provide: UserspaceStateService, useValue: uiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCatalogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call updateFilters when query parameters change', fakeAsync(() => {
    fixture.detectChanges();
    queryParamsSubject.next({
      brand: 'Kurhn',
      manufacturer: 'Kurhn',
      _sort: 'releaseYear',
      _order: 'DESC',
    });
    tick();

    expect(dollServiceMock.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        manufacturer: ['Kurhn'],
        brand: ['Kurhn'],
        _sort: 'releaseYear',
        _order: 'DESC',
      }),
    );
  }));

  it('should handle single string parameters and convert them to arrays', fakeAsync(() => {
    fixture.detectChanges();
    queryParamsSubject.next({ brand: 'Barbie' });
    tick();

    expect(dollServiceMock.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        brand: ['Barbie'],
      }),
    );
  }));

  it('should pass null filters when query params are empty', fakeAsync(() => {
    fixture.detectChanges();
    queryParamsSubject.next({});
    tick();

    expect(dollServiceMock.updateFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        manufacturer: null,
        brand: null,
      }),
    );
  }));

  it('should call loadMoreDolls when scroll action is executed', () => {
    fixture.detectChanges();
    component['service'].loadMoreDolls();
    expect(dollServiceMock.loadMoreDolls).toHaveBeenCalled();
  });

  it('should compute canLoadMore correctly', () => {
    const isLoading = dollServiceMock.isLoading as WritableSignal<boolean>;
    const hasMore = dollServiceMock.hasMore as WritableSignal<boolean>;

    isLoading.set(false);
    hasMore.set(true);
    expect(component['canLoadMore']()).toBeTrue();

    isLoading.set(true);
    expect(component['canLoadMore']()).toBeFalse();

    isLoading.set(false);
    hasMore.set(false);
    expect(component['canLoadMore']()).toBeFalse();
  });

  it('should render doll cards based on service dolls signal', () => {
    const dollsSignal = dollServiceMock.dolls as unknown as WritableSignal<
      any[]
    >;
    const mockDolls = [
      { id: '1', originalName: 'Doll 1' },
      { id: '2', originalName: 'Doll 2' },
    ];

    dollsSignal.set(mockDolls);
    fixture.detectChanges();

    const cardElements =
      fixture.nativeElement.querySelectorAll('app-doll-card');
    expect(cardElements.length).toBe(2);
  });
});
