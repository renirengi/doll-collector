import { TestBed } from '@angular/core/testing';
import { DollApiService } from '../../../api/services/doll.api';
import { Doll } from '../../shared/models/doll.model';
import { DollFilters } from '../../shared/models/doll-filters.model';
import * as T from '../../shared/models/doll-enums';
import { DollService } from './dollService';

describe('DollService', () => {
  let service: DollService;

  /**
   * Mock data for testing.
   */
  const mockDolls: Doll[] = [
    { id: '1', name: 'Doll 1' } as Doll,
    { id: '2', name: 'Doll 2' } as Doll,
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DollService],
    });
    service = TestBed.inject(DollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Test suite for initial filtering and reset logic.
   */
  describe('setRawFilters', () => {
    it('should reset dolls and fetch page 1 when new filters are applied', async () => {
      // Arrange
      const apiSpy = spyOn(DollApiService, 'getAll').and.resolveTo({
        data: mockDolls,
        total: 20,
      } as any);

      const newFilters: DollFilters = {
        brand: 'Kurhn' as T.DollBrand,
      };

      // Act
      await service.setRawFilters(newFilters);

      // Assert
      expect(service.dolls()).toEqual(mockDolls);
      expect(service.filters()._page).toBe(1);
      expect(service.filters().brand).toBe('Kurhn' as T.DollBrand);
      expect(service.hasMore()).toBe(true);
      expect(apiSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          brand: 'Kurhn' as T.DollBrand,
          _page: 1,
        }),
      );
    });
  });

  /**
   * Test suite for infinite scroll and pagination logic.
   */
  describe('loadMoreDolls', () => {
    it('should append dolls to the existing list when loading next page', async () => {
      // Arrange
      const initialDolls = [mockDolls[0]];
      const nextBatch = [mockDolls[1]];

      // Manually set initial state
      service['dollsSignal'].set(initialDolls);
      service.filters.set({ _page: 1, _limit: 12 });
      service.hasMore.set(true);

      const apiSpy = spyOn(DollApiService, 'getAll').and.resolveTo({
        data: nextBatch,
        total: 10,
      } as any);

      // Act
      service.loadMoreDolls();

      // Wait for async loadDolls to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Assert
      expect(service.dolls().length).toBe(2);
      expect(service.dolls()).toEqual([...initialDolls, ...nextBatch]);
      expect(service.filters()._page).toBe(2);
      expect(apiSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({ _page: 2 }),
      );
    });

    it('should not call API if isLoading is already true (request guard)', () => {
      // Arrange
      const apiSpy = spyOn(DollApiService, 'getAll');
      service.isLoading.set(true);

      // Act
      service.loadMoreDolls();

      // Assert
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it('should set hasMore to false when all items are loaded', async () => {
      // Arrange
      spyOn(DollApiService, 'getAll').and.resolveTo({
        data: mockDolls,
        total: 2, // Total count matches current list size
      } as any);

      // Act
      await service.setRawFilters({});

      // Assert
      expect(service.hasMore()).toBe(false);
    });
  });

  /**
   * Test suite for partial filter updates.
   */
  describe('updateFilters', () => {
    it('should merge new partial filters with existing ones and reset page', async () => {
      // Arrange
      service.filters.set({
        _page: 5,
        _limit: 12,
        manufacturer: 'Barbie' as T.Manufacturer,
      });
      const apiSpy = spyOn(DollApiService, 'getAll').and.resolveTo(mockDolls);

      const partialUpdate: Partial<DollFilters> = {
        brand: 'Kurhn' as T.DollBrand,
      };

      // Act
      service.updateFilters(partialUpdate);

      // Assert
      const finalFilters = service.filters();
      expect(finalFilters.brand).toBe('Kurhn' as T.DollBrand);
      expect(finalFilters.manufacturer).toBe('Barbie' as T.Manufacturer);
      expect(finalFilters._page).toBe(1);
      expect(apiSpy).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for error handling and state recovery.
   */
  describe('Error Handling', () => {
    it('should reset isLoading to false and log error if API request fails', async () => {
      // Arrange
      const errorMessage = 'Network Error';
      spyOn(DollApiService, 'getAll').and.rejectWith(errorMessage);
      const consoleSpy = spyOn(console, 'error');

      // Act
      await service.setRawFilters({});

      // Assert
      expect(service.isLoading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('API Error:', errorMessage);
    });
  });
});
