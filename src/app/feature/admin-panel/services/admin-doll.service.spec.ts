import { TestBed } from '@angular/core/testing';
import { AdminDollService } from './admin-doll.service';
import { DollApiService } from '../../../../api/services/doll.api';
import { Doll, DollsResponseDTO } from '../../../shared/models';

describe('AdminDollService', () => {
  let service: AdminDollService;
  let apiServiceSpy: jasmine.SpyObj<DollApiService>;

  const mockDolls: Doll[] = [
    { id: '1', originalName: 'Doll 1', itemNumber: 'SKU1' } as Doll,
    { id: '2', originalName: 'Doll 2', itemNumber: 'SKU2' } as Doll,
  ];

  const createMockResponse = (
    data: Doll[],
    page = 1,
    limit = 15,
  ): DollsResponseDTO => ({
    data,
    _page: page,
    _limit: limit,
  });

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DollApiService', [
      'getAll',
      'create',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [AdminDollService, { provide: DollApiService, useValue: spy }],
    });

    service = TestBed.inject(AdminDollService);
    apiServiceSpy = TestBed.inject(
      DollApiService,
    ) as jasmine.SpyObj<DollApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadPage', () => {
    it('should load dolls and update signals on success', async () => {
      apiServiceSpy.getAll.and.resolveTo(createMockResponse(mockDolls, 1, 2));

      await service.loadPage(1, 2);

      expect(service.dolls()).toEqual(mockDolls);
      expect(service.isLoading()).toBeFalse();
      expect(service.filters()).toEqual({ _page: 1, _limit: 2 });
      expect(service.hasNextPage()).toBeTrue();
    });

    it('should set dolls to empty array on error', async () => {
      apiServiceSpy.getAll.and.rejectWith('API Error');

      await service.loadPage(1);

      expect(service.dolls()).toEqual([]);
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('createDoll', () => {
    it('should call api.create and reload first page', async () => {
      const newDoll = { originalName: 'New' };
      apiServiceSpy.create.and.resolveTo({ id: '3', ...newDoll } as Doll);
      apiServiceSpy.getAll.and.resolveTo(createMockResponse(mockDolls));

      await service.createDoll(newDoll);

      expect(apiServiceSpy.create).toHaveBeenCalledWith(newDoll);
      expect(apiServiceSpy.getAll).toHaveBeenCalled();
      expect(service.filters()._page).toBe(1);
    });

    it('should throw error and stop loading if api fails', async () => {
      apiServiceSpy.create.and.rejectWith('Fail');

      await expectAsync(service.createDoll({})).toBeRejected();
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('deleteDoll', () => {
    it('should call api.delete and refresh current page', async () => {
      apiServiceSpy.delete.and.resolveTo();
      apiServiceSpy.getAll.and.resolveTo(createMockResponse(mockDolls));

      await service.deleteDoll('1');

      expect(apiServiceSpy.delete).toHaveBeenCalledWith('1');
      expect(apiServiceSpy.getAll).toHaveBeenCalled();
    });

    it('should go to previous page if last item on current page is deleted', async () => {
      service.dolls.set([{ id: 'last' } as Doll]);
      service.filters.set({ _page: 2, _limit: 15 });

      apiServiceSpy.delete.and.resolveTo();
      apiServiceSpy.getAll.and.resolveTo(createMockResponse([]));

      await service.deleteDoll('last');

      expect(apiServiceSpy.getAll).toHaveBeenCalledWith(
        jasmine.objectContaining({ _page: 1 }),
      );
    });
  });

  describe('mockTotal logic', () => {
    it('should set totalCount correctly when more items exist', async () => {
      const fullPage = new Array(15).fill({});
      apiServiceSpy.getAll.and.resolveTo(createMockResponse(fullPage, 1, 15));

      await service.loadPage(1, 15);
      expect(service.totalCount()).toBe(16);
    });

    it('should set totalCount exactly when no more items', async () => {
      const partialPage = new Array(5).fill({});
      apiServiceSpy.getAll.and.resolveTo(
        createMockResponse(partialPage, 1, 15),
      );

      await service.loadPage(1, 15);
      expect(service.totalCount()).toBe(5);
    });
  });
});
