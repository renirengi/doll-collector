import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCardComponent } from './doll-card.component';
import { Router, provideRouter } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal, WritableSignal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import * as T from '../../../../shared/models/doll-enums';
import { Doll, UserDoll, SidebarItem } from '../../../../shared/models';

class CollectionServiceMock {
  public menuItems: WritableSignal<SidebarItem[]> = signal([]);
  public collections: WritableSignal<any[]> = signal([]);
  public addToCollection = jasmine.createSpy('addToCollection');
}

describe('DollCardComponent', () => {
  let component: DollCardComponent;
  let fixture: ComponentFixture<DollCardComponent>;
  let router: Router;
  let collectionServiceMock: CollectionServiceMock;

  const mockCatalogDoll: Doll = {
    id: 'CATALOG_ID_123',
    originalName: 'Valentine Sweetheart Barbie',
    brand: 'Barbie' as T.DollBrand,
    series: 'Holiday',
    manufacturer: 'Mattel' as T.Manufacturer,
    articulation: 'FullyArticulated' as T.ArticulationType,
    bodyVolume: 'Standard' as T.BodyVolume,
    footType: 'Heeled' as T.FootType,
    isPlayset: false,
    gender: 'Female' as T.Gender,
  };

  const mockUserDoll: UserDoll = {
    id: 'INSTANCE_UUID_001',
    base: mockCatalogDoll,
    status: 'active' as T.DollStatus,
    purchaseState: 'New' as T.DollState,
    outfitState: 'original' as T.OutfitState,
    pets: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollCardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CollectionService, useClass: CollectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    collectionServiceMock = TestBed.inject(
      CollectionService,
    ) as unknown as CollectionServiceMock;

    component.doll = mockCatalogDoll;
    spyOnProperty(router, 'url', 'get').and.returnValue('/catalog');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Interactions', () => {
    beforeEach(() => spyOn(console, 'log'));

    it('should log correct id on click', () => {
      component.doll = mockUserDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Navigating to doll details:',
        'CATALOG_ID_123',
      );

      component.doll = mockCatalogDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Navigating to doll details:',
        'CATALOG_ID_123',
      );
    });

    it('should handle onAction and stop propagation', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      collectionServiceMock.collections.set([]);

      component.onAction('favorites', event);

      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('Data Logic', () => {
    it('should identify UserDoll', () => {
      expect(component.isUserDoll(mockUserDoll)).toBeTrue();
      expect(component.isUserDoll(mockCatalogDoll)).toBeFalse();
    });

    it('should use base doll data via d getter', () => {
      component.doll = mockUserDoll;
      expect(component.d.brand).toBe('Barbie');
      expect(component.d.id).toBe('CATALOG_ID_123');
    });
  });
});
