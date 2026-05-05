import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailsComponent } from './collection-details.component';
import { CollectionService } from '../../../../core/services/collection.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CollectionDetailsComponent', () => {
  let component: CollectionDetailsComponent;
  let fixture: ComponentFixture<CollectionDetailsComponent>;
  let collectionServiceMock: jasmine.SpyObj<CollectionService>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;

  const mockCollection = {
    id: 'col-123',
    name: 'Vintage Kurhn',
    description: 'A collection of classic Kurhn dolls from early 2000s.',
    dolls: [] as any[],
  };

  beforeEach(async () => {
    collectionServiceMock = jasmine.createSpyObj(
      'CollectionService',
      ['loadCollections', 'addToCollection'],
      {
        collections: signal([mockCollection]),
        menuItems: signal([]),
        isLoading: signal(false),
      },
    );

    uiStateMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [CollectionDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: CollectionService, useValue: collectionServiceMock },
        { provide: UserspaceStateService, useValue: uiStateMock },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailsComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('id', 'col-123');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the collection name and description', () => {
    const header = fixture.debugElement.query(By.css('.catalog-header'));
    const text = header.nativeElement.textContent;
    expect(text).toContain('Vintage Kurhn');
    expect(text).toContain('A collection of classic Kurhn dolls');
  });

  it('should show the loading spinner when service is loading and collection has no dolls', () => {
    const loadingCollection = { ...mockCollection, dolls: [] };
    (collectionServiceMock.collections as any).set([loadingCollection]);
    (collectionServiceMock.isLoading as any).set(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should render doll cards when dolls are available in collection object', () => {
    const mockDolls = [
      {
        id: 'd1',
        base: { id: 'b1', originalName: 'Doll 1', photos: [] },
      },
      {
        id: 'd2',
        base: { id: 'b2', originalName: 'Doll 2', photos: [] },
      },
    ];

    const updatedCollection = { ...mockCollection, dolls: mockDolls };
    (collectionServiceMock.collections as any).set([updatedCollection]);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-doll-card'));
    expect(cards.length).toBe(2);
  });

  it('should display empty state when dolls array is empty and not loading', () => {
    const emptyCollection = { ...mockCollection, dolls: [] };
    (collectionServiceMock.collections as any).set([emptyCollection]);
    (collectionServiceMock.isLoading as any).set(false);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState.nativeElement.textContent).toContain(
      'No dolls found in this collection.',
    );
  });

  it('should display "Collection not found" if the id does not match', () => {
    fixture.componentRef.setInput('id', 'non-existent-id');
    fixture.detectChanges();

    const content = fixture.debugElement.nativeElement.textContent;
    expect(content).toContain('Collection not found');
  });

  it('should toggle the filter panel visibility', () => {
    (uiStateMock.isFilterOpen as any).set(true);
    fixture.detectChanges();

    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    expect(filterPanel).toBeTruthy();
  });
});
