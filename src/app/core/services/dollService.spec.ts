import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { DollApiService } from '../../../api/services/doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';
import { Doll, DollsResponseDTO } from '../../shared/models/doll.model';
import { DollCatalogFilters } from '../../shared/models/doll-filters.model';
import { DollService } from './dollService';

describe('DollService', () => {
  let service: DollService;
  let apiServiceSpy: jasmine.SpyObj<DollApiService>;
  let uiStateSpy: jasmine.SpyObj<UserspaceStateService>;

  const mockDolls: Doll[] = [
    { id: '1', originalName: 'Doll 1' } as Doll,
    { id: '2', originalName: 'Doll 2' } as Doll,
  ];

  /**
   * Helper to create a standardized API response.
   */
  function createMockResponse(
    data: Doll[],
    page = 1,
    limit = 12,
    total = 89,
  ): DollsResponseDTO {
    return {
      data,
      _page: page,
      _limit: limit,
      total: total,
    };
  }

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj<DollApiService>('DollApiService', [
      'getAll',
    ]);

    // Mocking signal-based state service
    const totalDollsSignal = signal(0);
    const uiSpy = jasmine.createSpyObj('UserspaceStateService', [], {
      totalDolls: totalDollsSignal,
    });

    TestBed.configureTestingModule({
      providers: [
        DollService,
        { provide: DollApiService, useValue: apiSpy },
        { provide: UserspaceStateService, useValue: uiSpy },
      ],
    });

    service = TestBed.inject(DollService);
    apiServiceSpy = TestBed.inject(
      DollApiService,
    ) as jasmine.SpyObj<DollApiService>;
    uiStateSpy = TestBed.inject(
      UserspaceStateService,
    ) as jasmine.SpyObj<UserspaceStateService>;
  });

  describe('runLoadSequence Logic via setRawFilters', () => {
    it('should set hasMore to true if total in database is greater than loaded dolls', fakeAsync(() => {
      const twelveDolls = Array(12)
        .fill({})
        .map((_, i) => ({ id: `${i}` }) as Doll);

      apiServiceSpy.getAll.and.resolveTo(
        createMockResponse(twelveDolls, 1, 12, 50),
      );

      const filters: DollCatalogFilters = { _limit: 12 };
      service.setRawFilters(filters);

      tick();

      expect(service.hasMore()).toBeTrue();
      expect(service.dolls().length).toBe(12);
      expect(service.totalCount()).toBe(50);
      expect(uiStateSpy.totalDolls()).toBe(50);
    }));

    it('should set hasMore to false if all dolls are loaded', fakeAsync(() => {
      const fiveDolls = Array(5)
        .fill({})
        .map((_, i) => ({ id: `${i}` }) as Doll);

      apiServiceSpy.getAll.and.resolveTo(
        createMockResponse(fiveDolls, 1, 12, 5),
      );

      const filters: DollCatalogFilters = { _limit: 12 };
      service.setRawFilters(filters);

      tick();

      expect(service.hasMore()).toBeFalse();
    }));
  });

  describe('updateFilters', () => {
    it('should merge new filters with existing ones and reset to page 1', fakeAsync(() => {
      apiServiceSpy.getAll.and.resolveTo(createMockResponse([]));

      service.filters.set({ _page: 5, _limit: 12, brand: ['Barbie' as any] });

      service.updateFilters({ manufacturer: ['Mattel' as any] });
      tick();

      const lastFilters = service.filters();
      expect(lastFilters._page).toBe(1);
      expect(lastFilters.brand).toEqual(['Barbie' as any]);
      expect(lastFilters.manufacturer).toEqual(['Mattel' as any]);
    }));
  });

  describe('loadMoreDolls', () => {
    it('should append new dolls and increment page number', fakeAsync(() => {
      const page1 = [mockDolls[0]];
      const page2 = [mockDolls[1]];
      const totalOnServer = 89;

      // Setup initial state
      const internalSignal = service['dollsSignal'] as WritableSignal<Doll[]>;
      internalSignal.set(page1);
      service.totalCount.set(totalOnServer);
      service.hasMore.set(true);
      service.filters.set({ _page: 1, _limit: 1 });

      apiServiceSpy.getAll.and.resolveTo(
        createMockResponse(page2, 2, 1, totalOnServer),
      );

      service.loadMoreDolls();
      tick();

      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...page1, ...page2]);
      expect(service.filters()._page).toBe(2);
    }));

    it('should not trigger load if already loading', fakeAsync(() => {
      service.isLoading.set(true);
      service.loadMoreDolls();

      expect(apiServiceSpy.getAll).not.toHaveBeenCalled();
    }));
  });

  describe('Error Handling', () => {
    it('should reset state on first page failure', fakeAsync(() => {
      apiServiceSpy.getAll.and.rejectWith(new Error('API Error'));

      service.setRawFilters({});
      tick();

      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(service.hasMore()).toBeFalse();
    }));

    it('should keep existing dolls on subsequent page failure', fakeAsync(() => {
      const initialDolls = [mockDolls[0]];
      (service['dollsSignal'] as WritableSignal<Doll[]>).set(initialDolls);
      service.filters.set({ _page: 2, _limit: 12 });

      apiServiceSpy.getAll.and.rejectWith(new Error('API Error'));

      service.loadMoreDolls();
      tick();

      expect(service.dolls()).toEqual(initialDolls);
      expect(service.hasMore()).toBeFalse();
    }));
  });

  describe('Filter Sanitization', () => {
    it('should remove null, undefined and empty strings', fakeAsync(() => {
      apiServiceSpy.getAll.and.resolveTo(createMockResponse([]));

      const filters = {
        brand: '',
        manufacturer: null,
        articulation: undefined,
        releaseYear: 2024,
      } as any;

      service.setRawFilters(filters);
      tick();

      const sentFilters = apiServiceSpy.getAll.calls.mostRecent().args[0];
      expect(sentFilters.brand).toBeUndefined();
      expect(sentFilters.manufacturer).toBeUndefined();
      expect(sentFilters.releaseYear).toBe(2024);
    }));

    it('should remove empty arrays including flattened ones', fakeAsync(() => {
      apiServiceSpy.getAll.and.resolveTo(createMockResponse([]));

      const filters = {
        brand: [[]], // Nested empty array
        articulation: [],
        gender: ['Male' as any],
      } as any;

      service.setRawFilters(filters);
      tick();

      const sentFilters = apiServiceSpy.getAll.calls.mostRecent().args[0];
      expect(sentFilters.brand).toBeUndefined();
      expect(sentFilters.articulation).toBeUndefined();
      expect(sentFilters.gender).toEqual(['Male' as any]);
    }));
  });
});
