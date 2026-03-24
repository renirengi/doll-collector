import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DollApiService } from '../../../api/services/doll.api';
import { Doll } from '../../shared/models/doll.model';
import { DollFilters } from '../../shared/models/doll-filters.model';
import * as T from '../../shared/models/doll-enums';
import { DollService } from './dollService';

describe('DollService', () => {
  let service: DollService;
  let apiServiceSpy: jasmine.SpyObj<DollApiService>;

  /**
   * Mock data for testing.
   */
  const mockDolls: Doll[] = [
    { id: '1', name: 'Doll 1' } as Doll,
    { id: '2', name: 'Doll 2' } as Doll,
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DollApiService', ['getAll']);

    TestBed.configureTestingModule({
      providers: [DollService, { provide: DollApiService, useValue: spy }],
    });

    service = TestBed.inject(DollService);
    apiServiceSpy = TestBed.inject(
      DollApiService,
    ) as jasmine.SpyObj<DollApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test suite for initial filtering and reset logic.
   */
  describe('setRawFilters', () => {
    it('should reset dolls and fetch page 1 when new filters are applied', fakeAsync(() => {
      // Arrange
      const mockResponse = {
        data: mockDolls,
        total: mockDolls.length,
      };

      apiServiceSpy.getAll.and.resolveTo(mockResponse as any);

      const newFilters: DollFilters = {
        brand: 'Kurhn' as T.DollBrand,
      };

      // Act
      service.setRawFilters(newFilters);
      tick();

      // Assert
      expect(service.dolls()).toEqual(mockDolls);
      expect(service.filters()._page).toBe(1);
      expect(service.totalCount()).toBe(2);
      expect(service.hasMore()).toBe(false);
      expect(apiServiceSpy.getAll).toHaveBeenCalledWith(
        jasmine.objectContaining({
          brand: 'Kurhn' as T.DollBrand,
          _page: 1,
        }),
      );
    }));
  });

  /**
   * Test suite for infinite scroll and pagination logic.
   */
  describe('loadMoreDolls', () => {
    it('should append dolls to the existing list when loading next page', fakeAsync(() => {
      // Arrange
      const initialDolls = [mockDolls[0]];
      const nextBatch = [mockDolls[1]];

      service['dollsSignal'].set(initialDolls);
      service.filters.set({ _page: 1, _limit: 12 });
      service.hasMore.set(true);
      service.totalCount.set(10);

      apiServiceSpy.getAll.and.resolveTo(nextBatch);

      // Act
      service.loadMoreDolls();
      tick();

      // Assert
      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...initialDolls, ...nextBatch]);
      expect(service.filters()._page).toBe(2);
      expect(apiServiceSpy.getAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ _page: 2 }),
      );
    }));

    it('should not call API if isLoading is already true (request guard)', () => {
      // Arrange
      service.isLoading.set(true);

      // Act
      service.loadMoreDolls();

      // Assert
      expect(apiServiceSpy.getAll).not.toHaveBeenCalled();
    });

    it('should set hasMore to false when loaded count reaches totalCount', async () => {
      // Arrange
      apiServiceSpy.getAll.and.resolveTo(mockDolls);

      // Act
      await service.setRawFilters({});

      // Assert
      // В loadDolls: hasMore = dolls.length < total.
      expect(service.hasMore()).toBe(false);
    });
  });

  /**
   * Test suite for partial filter updates.
   */
  describe('updateFilters', () => {
    it('should merge new partial filters with existing ones and reset page', fakeAsync(() => {
      // Arrange
      service.filters.set({
        _page: 5,
        _limit: 12,
        manufacturer: 'Barbie' as T.Manufacturer,
      });
      apiServiceSpy.getAll.and.resolveTo(mockDolls);

      const partialUpdate: Partial<DollFilters> = {
        brand: 'Kurhn' as T.DollBrand,
      };

      // Act
      service.updateFilters(partialUpdate);
      tick();

      // Assert
      const finalFilters = service.filters();
      expect(finalFilters.brand).toBe('Kurhn' as T.DollBrand);
      expect(finalFilters.manufacturer).toBe('Barbie' as T.Manufacturer);
      expect(finalFilters._page).toBe(1);
      expect(apiServiceSpy.getAll).toHaveBeenCalled();
    }));
  });

  /**
   * Test suite for error handling and state recovery.
   */
  describe('Error Handling', () => {
    it('should reset isLoading to false and log error if API request fails', async () => {
      // Arrange
      const errorMessage = 'Network Error';
      apiServiceSpy.getAll.and.rejectWith(errorMessage);
      const consoleSpy = spyOn(console, 'error');

      // Act
      await service.setRawFilters({});

      // Assert
      expect(service.isLoading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', errorMessage);
    });
  });
});
