import { TestBed } from '@angular/core/testing';
import { CollectionService } from './collection.service';
import { CollectionApiService } from '../../../api/services/collection.api';
import { of } from 'rxjs';
import { Collection } from '../../shared/models/collection.model';

describe('CollectionService', () => {
  let service: CollectionService;
  let apiMock: jasmine.SpyObj<CollectionApiService>;

  const mockCollections: Collection[] = [
    { id: '1', name: 'Favorites', icon: 'star.svg' },
    { id: '2', name: 'My Custom Col', icon: 'diamond.svg' },
    { id: '3', name: 'Shelf', icon: 'box.svg' },
  ];

  beforeEach(() => {
    apiMock = jasmine.createSpyObj('CollectionApiService', [
      'getAll',
      'create',
      'delete',
    ]);
    apiMock.getAll.and.returnValue(of(mockCollections));

    TestBed.configureTestingModule({
      providers: [
        CollectionService,
        { provide: CollectionApiService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(CollectionService);
  });

  it('should load collections on init', () => {
    expect(service.collections()).toEqual(mockCollections);
  });

  it('should filter menuItems correctly', () => {
    const items = service.menuItems();
    expect(items.length).toBe(1);
    expect(items[0].label).toBe('My Custom Col');
    expect(items[0].route).toBe('/user/collections/2');
    expect(items[0].id).toBe('2');
  });

  it('should add collection', async () => {
    const newCol: Collection = { id: '4', name: 'New One', icon: 'icon.svg' };
    apiMock.create.and.returnValue(of(newCol));

    await service.createCollection({
      name: 'New One',
      icon: 'icon.svg',
      description: 'desc',
    });

    expect(service.collections()).toContain(newCol);
  });

  it('should delete collection', async () => {
    apiMock.delete.and.returnValue(of(void 0));

    await service.deleteCollection('1');

    expect(service.collections().length).toBe(2);
    expect(service.collections().find((c) => c.id === '1')).toBeUndefined();
  });

  it('should compute count', () => {
    expect(service.count()).toBe(3);
  });
});
