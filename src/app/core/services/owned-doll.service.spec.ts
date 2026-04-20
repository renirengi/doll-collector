import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { OwnedDollApiService } from '../../../api/services/owned-doll.api';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';
import {
  UserDoll,
  UserDollResponseDTO,
  OwnedDollSortAndFilterDto,
} from '../../shared/models';
import { OwnedDollService } from './owned-doll.service';
import { MessageService } from './message-service.service';

describe('OwnedDollService', () => {
  let service: OwnedDollService;
  let apiServiceSpy: jasmine.SpyObj<OwnedDollApiService>;
  let uiStateSpy: jasmine.SpyObj<UserspaceStateService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockDolls: UserDoll[] = [
    { id: '1', name: 'Doll 1' } as UserDoll,
    { id: '2', name: 'Doll 2' } as UserDoll,
  ];

  function createMockResponse(
    data: UserDoll[],
    page = 1,
    limit = 12,
    total = 14,
  ): UserDollResponseDTO {
    return {
      data,
      page,
      limit,
      total,
    };
  }

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj<OwnedDollApiService>(
      'OwnedDollApiService',
      ['findAll', 'sortAndFilter', 'delete', 'update'],
    );

    const totalDollsSignal = signal(0);
    const uiSpy = jasmine.createSpyObj('UserspaceStateService', [], {
      totalDolls: totalDollsSignal,
    });

    const msgSpy = jasmine.createSpyObj('MessageService', [
      'showSuccess',
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        OwnedDollService,
        { provide: OwnedDollApiService, useValue: apiSpy },
        { provide: UserspaceStateService, useValue: uiSpy },
        { provide: MessageService, useValue: msgSpy },
      ],
    });

    service = TestBed.inject(OwnedDollService);
    apiServiceSpy = TestBed.inject(
      OwnedDollApiService,
    ) as jasmine.SpyObj<OwnedDollApiService>;
    uiStateSpy = TestBed.inject(
      UserspaceStateService,
    ) as jasmine.SpyObj<UserspaceStateService>;
    messageServiceSpy = TestBed.inject(
      MessageService,
    ) as jasmine.SpyObj<MessageService>;
  });

  describe('loadShelf', () => {
    it('should use findAll when no criteria are provided', fakeAsync(() => {
      apiServiceSpy.findAll.and.returnValue(of(createMockResponse(mockDolls)));

      service.loadShelf(null, 1);
      tick();

      expect(apiServiceSpy.findAll).toHaveBeenCalledWith(1, 12);
      expect(service.dolls()).toEqual(mockDolls);
      expect(service.totalCount()).toBe(14);
      expect(uiStateSpy.totalDolls()).toBe(14);
    }));

    it('should use sortAndFilter when criteria are present', fakeAsync(() => {
      const criteria: OwnedDollSortAndFilterDto = {
        filterCriteria: { status: ['active'] },
        sortCriteria: { ownedDollSortBy: 'name', ownedDollSortOrder: 'ASC' },
      };
      apiServiceSpy.sortAndFilter.and.returnValue(
        of(createMockResponse(mockDolls)),
      );

      service.loadShelf(criteria, 1);
      tick();

      expect(apiServiceSpy.sortAndFilter).toHaveBeenCalledWith(criteria, 1, 12);
    }));

    it('should overwrite dolls on page 1', fakeAsync(() => {
      const initialDolls = [{ id: 'old' } as UserDoll];
      (service.dolls as WritableSignal<UserDoll[]>).set(initialDolls);

      apiServiceSpy.findAll.and.returnValue(
        of(createMockResponse(mockDolls, 1)),
      );

      service.loadShelf(null, 1);
      tick();

      expect(service.dolls()).toEqual(mockDolls);
      expect(service.dolls().length).toBe(2);
    }));

    it('should append dolls on subsequent pages', fakeAsync(() => {
      const initialDolls = [mockDolls[0]];
      (service.dolls as WritableSignal<UserDoll[]>).set(initialDolls);

      const newDolls = [mockDolls[1]];
      apiServiceSpy.findAll.and.returnValue(
        of(createMockResponse(newDolls, 2)),
      );

      service.loadShelf(null, 2);
      tick();

      expect(service.dolls()).toEqual([...initialDolls, ...newDolls]);
      expect(service.dolls().length).toBe(2);
    }));

    it('should prevent concurrent loads', fakeAsync(() => {
      apiServiceSpy.findAll.and.returnValue(of(createMockResponse(mockDolls)));

      service.loadShelf(null, 1);
      service.loadShelf(null, 2);
      tick();

      expect(apiServiceSpy.findAll).toHaveBeenCalledTimes(1);
    }));
  });

  describe('deleteFromShelf', () => {
    it('should call delete and reload page 1', fakeAsync(() => {
      apiServiceSpy.delete.and.returnValue(of(void 0));
      apiServiceSpy.findAll.and.returnValue(of(createMockResponse([])));

      service.deleteFromShelf('1');
      tick();

      expect(apiServiceSpy.delete).toHaveBeenCalledWith('1');
      expect(apiServiceSpy.findAll).toHaveBeenCalledWith(1, 12);
      expect(messageServiceSpy.showSuccess).toHaveBeenCalled();
    }));
  });

  describe('updateDollDetails', () => {
    it('should update specific doll in signal without full reload', fakeAsync(() => {
      const initialDolls = [{ id: '1', name: 'Old Name' } as UserDoll];
      (service.dolls as WritableSignal<UserDoll[]>).set(initialDolls);

      const updatedDoll = { id: '1', name: 'New Name' } as UserDoll;
      apiServiceSpy.update.and.returnValue(of(updatedDoll));

      service.updateDollDetails('1', { name: 'New Name' });
      tick();

      expect(service.dolls()[0].name).toBe('New Name');
    }));
  });

  describe('Error Handling', () => {
    it('should reset state only if page 1 fails', fakeAsync(() => {
      apiServiceSpy.findAll.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      service.loadShelf(null, 1);
      tick();

      expect(service.dolls()).toEqual([]);
      expect(service.totalCount()).toBe(0);
      expect(uiStateSpy.totalDolls()).toBe(0);
    }));
  });
});
