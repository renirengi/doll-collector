import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DollApiService } from '../../../api/services/doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';
import { Doll } from '../../shared/models/doll.model';
import { DollService } from './dollService';

describe('DollService', () => {
  let service: DollService;
  let apiServiceSpy: jasmine.SpyObj<DollApiService>;
  let uiStateSpy: jasmine.SpyObj<UserspaceStateService>;

  const mockDolls: Doll[] = [
    { id: '1', originalName: 'Doll 1' } as Doll,
    { id: '2', originalName: 'Doll 2' } as Doll,
  ];

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('DollApiService', [
      'getAll',
      'getById',
    ]);
    const uiSpy = jasmine.createSpyObj('UserspaceStateService', [], {
      totalDolls: signal(0),
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
      apiServiceSpy.getAll.and.resolveTo(twelveDolls);

      service.setRawFilters({ _limit: 12 } as any);

      tick();

      expect(service.hasMore()).toBeTrue();
      expect(service.dolls().length).toBe(12);
    }));

    it('should set hasMore to false if response length is less than limit', fakeAsync(() => {
      const fiveDolls = Array(5)
        .fill({})
        .map((_, i) => ({ id: `${i}` }) as Doll);
      apiServiceSpy.getAll.and.resolveTo(fiveDolls);

      service.setRawFilters({ _limit: 12 } as any);
      tick();

      expect(service.hasMore()).toBeFalse();
    }));
  });

  describe('loadMoreDolls', () => {
    it('should append new dolls and NOT overwrite totalCount from page 1', fakeAsync(() => {
      const page1 = [mockDolls[0]];
      const page2 = [mockDolls[1]];

      // Setup state for page 1
      service['dollsSignal'].set(page1);
      service.totalCount.set(1);
      service.hasMore.set(true);
      service.filters.set({ _page: 1, _limit: 1 });

      // Mock API for page 2
      apiServiceSpy.getAll.and.resolveTo(page2);

      service.loadMoreDolls();
      tick();

      // Should have both dolls now
      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...page1, ...page2]);
      // In your code for page > 1, totalCount is NOT updated, so it stays 1 (from page 1)
      expect(service.totalCount()).toBe(1);
    }));
  });

  describe('Error Handling', () => {
    it('should reset state on page 1 failure', fakeAsync(() => {
      apiServiceSpy.getAll.and.rejectWith('API Error');

      service.setRawFilters({});
      tick();

      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(service.hasMore()).toBeFalse();
    }));
  });
});
