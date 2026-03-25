import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DollApiService } from '../../../api/services/doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';
import { Doll, UserDoll } from '../../shared/models/doll.model';
import { DollCatalogFilters } from '../../shared/models/doll-filters.model';
import * as T from '../../shared/models/doll-enums';
import { DollService } from './dollService';
import { signal } from '@angular/core';

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setRawFilters', () => {
    it('should reset dolls and fetch page 1 when new filters are applied', fakeAsync(() => {
      const mockResponse = {
        data: mockDolls,
        total: mockDolls.length,
      };

      apiServiceSpy.getAll.and.resolveTo(mockResponse as any);

      const newFilters: DollCatalogFilters = {
        brand: 'Kurhn' as T.DollBrand,
      };

      service.setRawFilters(newFilters);
      tick();

      expect(service.dolls()).toEqual(mockDolls);
      expect(service.filters()._page).toBe(1);
      expect(service.totalCount()).toBe(2);
      expect(apiServiceSpy.getAll).toHaveBeenCalledWith(
        jasmine.objectContaining({
          brand: 'Kurhn' as T.DollBrand,
          _page: 1,
        }),
      );
    }));
  });

  describe('loadMoreDolls', () => {
    it('should append dolls to the existing list when loading next page', fakeAsync(() => {
      const initialDolls = [mockDolls[0]];
      const nextBatch = [mockDolls[1]];

      service['dollsSignal'].set(initialDolls);
      service.filters.set({ _page: 1, _limit: 12 });
      service.hasMore.set(true);

      apiServiceSpy.getAll.and.resolveTo({ data: nextBatch, total: 2 } as any);

      service.loadMoreDolls();
      tick();

      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...initialDolls, ...nextBatch]);
      expect(service.filters()._page).toBe(2);
    }));

    it('should not call API if isLoading is already true', () => {
      service.isLoading.set(true);
      service.loadMoreDolls();
      expect(apiServiceSpy.getAll).not.toHaveBeenCalled();
    });
  });

  describe('updateFilters', () => {
    it('should merge partial filters and reset page to 1', fakeAsync(() => {
      service.filters.set({
        _page: 5,
        _limit: 12,
        brand: 'Kurhn' as T.DollBrand,
      });
      apiServiceSpy.getAll.and.resolveTo({ data: mockDolls, total: 2 } as any);

      service.updateFilters({ bodyVolume: ['Standard'] as T.BodyVolume[] });
      tick();

      const currentFilters = service.filters();
      expect(currentFilters._page).toBe(1);
      expect(currentFilters.brand).toBe('Kurhn' as T.DollBrand);
      expect(currentFilters.bodyVolume).toEqual(['Standard'] as T.BodyVolume[]);
    }));
  });

  describe('enrichUserDolls', () => {
    it('should fetch catalog data for each unique dollId and merge it', async () => {
      const userDolls: UserDoll[] = [
        { id: 'u1', dollId: '1', name: 'My Doll' } as UserDoll,
        { id: 'u2', dollId: '1', name: 'My Second Doll' } as UserDoll,
      ];

      apiServiceSpy.getById.and.callFake((id: string) => {
        return Promise.resolve(mockDolls.find((d) => d.id === id) as Doll);
      });

      const enriched = await service['enrichUserDolls'](userDolls);

      expect(enriched.length).toBe(2);
      expect(enriched[0].catalogInfo.id).toBe('1');
      expect(apiServiceSpy.getById).toHaveBeenCalledTimes(1); // One unique ID
    });
  });
});
