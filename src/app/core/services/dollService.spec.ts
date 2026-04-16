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

  const createMockResponse = (
    data: Doll[],
    page = 1,
    limit = 12,
  ): DollsResponseDTO => ({
    data,
    _page: page,
    _limit: limit,
  });

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('DollApiService', [
      'getAll',
      'getById',
    ]);

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
    it('should set hasMore to true if response length equals limit', fakeAsync(() => {
      const twelveDolls = Array(12)
        .fill({})
        .map((_, i) => ({ id: `${i}` }) as Doll);

      apiServiceSpy.getAll.and.resolveTo(
        createMockResponse(twelveDolls, 1, 12),
      );

      const filters: DollCatalogFilters = { _limit: 12 };
      service.setRawFilters(filters);

      tick();

      expect(service.hasMore()).toBeTrue();
      expect(service.dolls().length).toBe(12);
    }));

    it('should set hasMore to false if response length is less than limit', fakeAsync(() => {
      const fiveDolls = Array(5)
        .fill({})
        .map((_, i) => ({ id: `${i}` }) as Doll);

      apiServiceSpy.getAll.and.resolveTo(createMockResponse(fiveDolls, 1, 12));

      const filters: DollCatalogFilters = { _limit: 12 };
      service.setRawFilters(filters);

      tick();

      expect(service.hasMore()).toBeFalse();
    }));
  });

  describe('loadMoreDolls', () => {
    it('should append new dolls and increment totalCount', fakeAsync(() => {
      const page1 = [mockDolls[0]];
      const page2 = [mockDolls[1]];

      const internalSignal = service['dollsSignal'] as WritableSignal<Doll[]>;
      internalSignal.set(page1);

      service.totalCount.set(1);
      service.hasMore.set(true);
      service.filters.set({ _page: 1, _limit: 1 });

      apiServiceSpy.getAll.and.resolveTo(createMockResponse(page2, 2, 1));

      service.loadMoreDolls();
      tick();

      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...page1, ...page2]);
      expect(service.totalCount()).toBe(2);
    }));
  });

  describe('Error Handling', () => {
    it('should reset state on page 1 failure', fakeAsync(() => {
      apiServiceSpy.getAll.and.rejectWith(new Error('API Error'));

      service.setRawFilters({});
      tick();

      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(service.hasMore()).toBeFalse();
    }));
  });

  describe('Filter Sanitization', () => {
    it('should flatten and clean array filters', fakeAsync(() => {
      apiServiceSpy.getAll.and.resolveTo(createMockResponse([]));

      const filters = {
        articulation: [['Basic', 'Other']] as any,
      } as DollCatalogFilters;

      service.setRawFilters(filters);
      tick();

      const lastCall = apiServiceSpy.getAll.calls.mostRecent();
      const sentFilters = lastCall.args[0];

      expect(sentFilters.articulation).toEqual(['Basic', 'Other']);
    }));
  });
});
