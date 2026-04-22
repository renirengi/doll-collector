import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      ['setRawFilters', 'loadMoreDolls'],
      {
        dolls: signal([]),
        isLoading: signal(false),
        hasMore: signal(true),
      },
    );

    uiServiceMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
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

  it('should call setRawFilters when query parameters change', () => {
    fixture.detectChanges();
    queryParamsSubject.next({ brand: 'Kurhn', manufacturer: 'Kurhn' });
    expect(dollServiceMock.setRawFilters).toHaveBeenCalledWith({
      manufacturer: ['Kurhn'],
      brand: ['Kurhn'],
    });
  });

  it('should handle single string parameters and convert them to arrays', () => {
    fixture.detectChanges();
    queryParamsSubject.next({ brand: 'Barbie' });
    expect(dollServiceMock.setRawFilters).toHaveBeenCalledWith(
      jasmine.objectContaining({
        brand: ['Barbie'],
      }),
    );
  });

  it('should pass null filters when query params are empty', () => {
    fixture.detectChanges();
    queryParamsSubject.next({});
    expect(dollServiceMock.setRawFilters).toHaveBeenCalledWith({
      manufacturer: null,
      brand: null,
    });
  });

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
      { id: '1', base: { originalName: 'Doll 1' } },
      { id: '2', base: { originalName: 'Doll 2' } },
    ];

    dollsSignal.set(mockDolls);
    fixture.detectChanges();

    const cardElements =
      fixture.nativeElement.querySelectorAll('app-doll-card');
    expect(cardElements.length).toBe(2);
  });
});
