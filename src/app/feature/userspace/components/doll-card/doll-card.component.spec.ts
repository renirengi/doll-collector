import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCardComponent } from './doll-card.component';
import { Router } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal, WritableSignal } from '@angular/core';
import * as T from '../../../../shared/models/doll-enums';
import {
  Doll,
  UserDoll,
  SidebarItem,
  DollDataType,
} from '../../../../shared/models';

class CollectionServiceMock {
  public menuItems: WritableSignal<SidebarItem[]> = signal([]);
}

describe('DollCardComponent', () => {
  let component: DollCardComponent;
  let fixture: ComponentFixture<DollCardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
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

  const mockDynamicItems: SidebarItem[] = [
    {
      id: 'col_1',
      route: '/user/collections/1',
      iconClass: 'icon-custom',
      label: 'Custom Col',
    },
  ];

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', [], ['url']);

    await TestBed.configureTestingModule({
      imports: [DollCardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CollectionService, useClass: CollectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCardComponent);
    component = fixture.componentInstance;
    collectionServiceMock = TestBed.inject(
      CollectionService,
    ) as unknown as CollectionServiceMock;

    component.doll = mockCatalogDoll;

    (
      Object.getOwnPropertyDescriptor(routerSpy, 'url')?.get as jasmine.Spy
    ).and.returnValue('/catalog');

    fixture.detectChanges();
  });

  describe('Signal: availableActions', () => {
    it('should show static and dynamic actions when on catalog page', () => {
      collectionServiceMock.menuItems.set(mockDynamicItems);
      fixture.detectChanges();

      const actions = component['availableActions']();
      expect(actions.length).toBe(5);
      expect(actions.find((a) => a.id === 'col_1')).toBeDefined();
    });

    it('should filter out current route from actions', () => {
      const urlSpy = Object.getOwnPropertyDescriptor(routerSpy, 'url')
        ?.get as jasmine.Spy;
      urlSpy.and.returnValue('/user/favorites');

      collectionServiceMock.menuItems.set([]);
      fixture.detectChanges();

      const actions = component['availableActions']();
      expect(actions.length).toBe(3);
      expect(actions.find((a) => a.id === 'favorites')).toBeUndefined();
    });
  });

  describe('Data Logic', () => {
    it('should identify UserDoll by checking for "base" property', () => {
      expect(component.isUserDoll(mockUserDoll)).toBeTrue();
      expect(component.isUserDoll(mockCatalogDoll)).toBeFalse();
    });

    it('should extract catalog info via d getter', () => {
      component.doll = mockUserDoll;
      expect(component.d.id).toBe('CATALOG_ID_123');
      expect(component.d.originalName).toBe('Valentine Sweetheart Barbie');
    });
  });

  describe('Interactions', () => {
    beforeEach(() => spyOn(console, 'log'));

    it('should log correct id on click', () => {
      component.doll = mockUserDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Clicked doll ID:',
        'INSTANCE_UUID_001',
      );

      component.doll = mockCatalogDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Clicked doll ID:',
        'CATALOG_ID_123',
      );
    });

    it('should handle onAction', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.onAction('shop', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/Moving Valentine Sweetheart Barbie to: shop/),
      );
    });
  });
});
