import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CollectionService } from './collection.service';
import { CollectionApiService } from '../../../api/services/collection.api';
import { of, throwError } from 'rxjs';
import {
  Collection,
  CollectionsResponseDTO,
} from '../../shared/models/collection.model';
import { MessageService } from './message-service.service';
import { UserspaceStateService } from '../../feature/userspace/service/userspace-state.service';
import { Doll } from '../../shared/models';

describe('CollectionService', () => {
  let service: CollectionService;
  let apiMock: jasmine.SpyObj<CollectionApiService>;
  let messageMock: jasmine.SpyObj<MessageService>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;

  const mockDoll: Doll = {
    id: 'd1',
    originalName: 'Kurhn Doll',
    brand: 'Kurhn',
    series: 'Classic',
    manufacturer: 'Kurhn',
    articulation: 'FullyArticulated',
    bodyVolume: 'Standard',
    footType: 'Heeled',
    isPlayset: false,
    gender: 'Female',
  };

  const mockCollections: Collection[] = [
    { id: '1', name: 'Favorites', icon: 'star.svg', dolls: [mockDoll] },
    { id: '2', name: 'My Custom Col', icon: 'diamond.svg', dolls: [] },
  ];

  const mockResponse: CollectionsResponseDTO = {
    data: mockCollections,
    _page: 1,
    _limit: 100,
  };

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('CollectionApiService', [
      'getAll',
      'create',
      'delete',
    ]);
    messageMock = jasmine.createSpyObj('MessageService', ['show']);
    uiStateMock = jasmine.createSpyObj('UserspaceStateService', ['totalDolls']);

    apiMock.getAll.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      providers: [
        CollectionService,
        { provide: CollectionApiService, useValue: apiMock },
        { provide: MessageService, useValue: messageMock },
        { provide: UserspaceStateService, useValue: uiStateMock },
      ],
    });

    service = TestBed.inject(CollectionService);
  });

  it('should manage isLoading state during loadCollections', async () => {
    // Initial call from constructor might still be pending,
    // but we can manually trigger and check flags
    const promise = service.loadCollections();
    expect(service.isLoading()).toBeTrue();

    await promise;
    expect(service.isLoading()).toBeFalse();
    expect(service.collections()).toEqual(mockCollections);
  });

  it('should load and map dolls in loadCollectionDolls', async () => {
    await service.loadCollections();

    await service.loadCollectionDolls('1', 1);

    const dolls = service.dolls();
    expect(dolls.length).toBe(1);
    expect(dolls[0].base.brand).toBe('Kurhn'); // Verify mapping to base property
    expect(dolls[0].status).toBe('active'); // Verify default enum value
    expect(service.totalCount()).toBe(1);
  });

  it('should append dolls when loading next page', async () => {
    // Create a mock collection with multiple dolls to test pagination
    const manyDolls = Array(20)
      .fill(null)
      .map((_, i) => ({ ...mockDoll, id: `d${i}` }));
    const customResponse: CollectionsResponseDTO = {
      data: [
        {
          id: 'paginated',
          name: 'Big Col',
          icon: 'icon.svg',
          dolls: manyDolls,
        },
      ],
      _page: 1,
      _limit: 100,
    };
    apiMock.getAll.and.returnValue(of(customResponse));

    await service.loadCollections();
    service.currentLimit.set(10);

    // Page 1
    await service.loadCollectionDolls('paginated', 1);
    expect(service.dolls().length).toBe(10);

    // Page 2
    await service.loadCollectionDolls('paginated', 2);
    expect(service.dolls().length).toBe(20);
    expect(service.currentPage()).toBe(2);
  });

  it('should reset dolls and count on error if page is 1', async () => {
    await service.loadCollections();

    // Simulate error by finding no collection (service logic handling)
    await service.loadCollectionDolls('non-existent', 1);

    expect(service.dolls()).toEqual([]);
    expect(service.totalCount()).toBe(0);
  });

  it('should filter menuItems correctly', async () => {
    await service.loadCollections();
    const items = service.menuItems();

    // Favorites/Shelf are usually filtered out by IconUtils.isCustom logic
    expect(items.length).toBe(1);
    expect(items[0].label).toBe('My Custom Col');
  });
});
