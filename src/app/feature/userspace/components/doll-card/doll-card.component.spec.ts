import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCardComponent } from './doll-card.component';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import * as T from '../../../../shared/models/doll-enums';
import { Doll, EnrichedUserDoll } from '../../../../shared/models';

describe('DollCardComponent', () => {
  let component: DollCardComponent;
  let fixture: ComponentFixture<DollCardComponent>;
  let routerSpy: jasmine.SpyObj<Router>;

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

  beforeEach(async () => {
    // Create a spy object where 'url' is a getter spy
    routerSpy = jasmine.createSpyObj('Router', [], ['url']);

    await TestBed.configureTestingModule({
      imports: [DollCardComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCardComponent);
    component = fixture.componentInstance;
    component.doll = mockCatalogDoll;

    // Default URL
    (
      Object.getOwnPropertyDescriptor(routerSpy, 'url')?.get as jasmine.Spy
    ).and.returnValue('/catalog');

    fixture.detectChanges();
  });

  describe('Signal: availableActions', () => {
    it('should show all 4 actions when on catalog page', () => {
      const urlSpy = Object.getOwnPropertyDescriptor(routerSpy, 'url')
        ?.get as jasmine.Spy;
      urlSpy.and.returnValue('/catalog');

      fixture.detectChanges();

      const actions = component['availableActions']();
      expect(actions.length).toBe(4);
    });
  });

  describe('Data Logic: isUserDoll and d getter', () => {
    it('should correctly identify EnrichedUserDoll', () => {
      expect(component.isUserDoll(mockUserDoll)).toBeTrue();
      expect(component.isUserDoll(mockCatalogDoll)).toBeFalse();
    });

    it('should extract catalog info via getter d for both types', () => {
      component.doll = mockUserDoll;
      fixture.detectChanges();
      expect(component.d.originalName).toBe('Valentine Sweetheart Barbie');

      component.doll = mockCatalogDoll;
      fixture.detectChanges();
      expect(component.d.originalName).toBe('Valentine Sweetheart Barbie');
    });
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      spyOn(console, 'log');
    });

    it('should log dollId when clicking user doll', () => {
      component.doll = mockUserDoll;
      fixture.detectChanges();
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Клик по кукле:',
        'USER_REFERENCE_ID',
      );
    });

    it('should log catalog id when clicking catalog doll', () => {
      component.doll = mockCatalogDoll;
      fixture.detectChanges();
      component.onCardClick();
      expect(console.log).toHaveBeenCalledWith(
        'Клик по кукле:',
        'CATALOG_ID_123',
      );
    });

    it('should handle onAction with stopPropagation', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.onAction('shop', event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /Переместить Valentine Sweetheart Barbie в список: shop/,
        ),
      );
    });
  });

  describe('Template Rendering', () => {
    it('should render doll original name', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nameTag = compiled.querySelector('.original-name');
      expect(nameTag?.textContent).toContain('Valentine Sweetheart Barbie');
    });
  });
});
