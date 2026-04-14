import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCardComponent } from './doll-card.component';
import { Router } from '@angular/router';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal, WritableSignal } from '@angular/core';
import * as T from '../../../../shared/models/doll-enums';
import { Doll, EnrichedUserDoll, SidebarItem } from '../../../../shared/models';

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
    articulation: 'Standard' as T.ArticulationType,
    bodyVolume: 'Slim' as T.BodyVolume,
    footType: 'Heeled' as T.FootType,
    isPlayset: false,
    gender: 'Female' as T.Gender,
  };

  const mockUserDoll: EnrichedUserDoll = {
    id: 'INSTANCE_UUID_001',
    dollId: 'USER_REFERENCE_ID',
    dollState: 'New' as T.DollState,
    outfitState: 'Complete' as T.OutfitState,
    status: 'InCollection' as T.DollStatus,
    catalogInfo: mockCatalogDoll,
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
    it('should identify EnrichedUserDoll', () => {
      expect(component.isUserDoll(mockUserDoll)).toBeTrue();
      expect(component.isUserDoll(mockCatalogDoll)).toBeFalse();
    });

    it('should extract catalog info via d', () => {
      component.doll = mockUserDoll;
      expect(component.d.id).toBe('CATALOG_ID_123');
    });
  });

  describe('Interactions', () => {
    beforeEach(() => spyOn(console, 'log'));

    it('should log correct id on click', () => {
      component.doll = mockUserDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Клик по кукле:',
        'USER_REFERENCE_ID',
      );

      component.doll = mockCatalogDoll;
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Клик по кукле:',
        'CATALOG_ID_123',
      );
    });

    it('should handle onAction', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.onAction('shop', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /\[TODO\] Move Valentine Sweetheart Barbie to: shop/,
        ),
      );
    });
  });
});
