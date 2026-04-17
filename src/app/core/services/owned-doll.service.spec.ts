import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OwnedDollService } from './owned-doll.service';
import { OwnedDollApiService } from '../../../api/services/owned-doll.api';
import { MessageService } from './message-service.service';
import {
  UserDoll,
  UserDollResponseDTO,
  OwnedDollSortAndFilterDto,
} from '../../shared/models';

describe('OwnedDollService', () => {
  let service: OwnedDollService;
  let apiMock: jasmine.SpyObj<OwnedDollApiService>;
  let messageMock: jasmine.SpyObj<MessageService>;

  const mockResponse: UserDollResponseDTO = {
    data: [{ id: '1', name: 'Test Doll' } as UserDoll],
    total: 1,
    page: 1,
    limit: 12,
  };

  const mockCriteria: OwnedDollSortAndFilterDto = {
    filterCriteria: {},
    sortCriteria: { ownedDollSortBy: 'createdAt', ownedDollSortOrder: 'DESC' },
  };

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('OwnedDollApiService', [
      'sortAndFilter',
      'delete',
      'update',
    ]);
    messageMock = jasmine.createSpyObj('MessageService', [
      'showError',
      'showSuccess',
    ]);

    TestBed.configureTestingModule({
      providers: [
        OwnedDollService,
        { provide: OwnedDollApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
      ],
    });

    service = TestBed.inject(OwnedDollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadShelf', () => {
    /**
     * Test successful loading of shelf data.
     */
    it('should update dolls and totalCount signals on success', () => {
      apiMock.sortAndFilter.and.returnValue(of(mockResponse));

      service.loadShelf(mockCriteria);

      expect(service.dolls()).toEqual(mockResponse.data);
      expect(service.totalCount()).toBe(mockResponse.total);
      expect(service.isLoading()).toBeFalse();
    });

    /**
     * Test error handling during loading.
     */
    it('should show error message and clear signals on failure', () => {
      apiMock.sortAndFilter.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.loadShelf(mockCriteria);

      expect(messageMock.showError).toHaveBeenCalledWith(jasmine.any(String));
      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('deleteFromShelf', () => {
    /**
     * Test deletion and subsequent list refresh.
     */
    it('should call delete and reload the shelf on success', () => {
      apiMock.delete.and.returnValue(of(undefined));
      apiMock.sortAndFilter.and.returnValue(of(mockResponse));

      service.deleteFromShelf('1', mockCriteria);

      expect(apiMock.delete).toHaveBeenCalledWith('1');
      expect(messageMock.showSuccess).toHaveBeenCalled();
      // Verify refresh call
      expect(apiMock.sortAndFilter).toHaveBeenCalled();
    });
  });

  describe('updateDollDetails', () => {
    /**
     * Test local signal update after successful patch.
     */
    it('should update the specific doll in the dolls signal locally', () => {
      const initialDoll = { id: '1', name: 'Old Name' } as UserDoll;
      const updatedData = { name: 'New Name' } as UserDoll;

      service.dolls.set([initialDoll]);
      apiMock.update.and.returnValue(of({ ...initialDoll, ...updatedData }));

      service.updateDollDetails('1', updatedData);

      expect(service.dolls()[0].name).toBe('New Name');
      expect(messageMock.showSuccess).toHaveBeenCalled();
    });
  });

  describe('clearShelfState', () => {
    /**
     * Test resetting state.
     */
    it('should reset all signals to default values', () => {
      service.dolls.set([{ id: '1' } as UserDoll]);
      service.totalCount.set(10);

      service.clearShelfState();

      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(service.currentPage()).toBe(1);
    });
  });
});
