import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailsComponent } from './collection-details.component';
import { CollectionService } from '../../../../core/services/collection.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { signal, computed } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('CollectionDetailsComponent', () => {
  let component: CollectionDetailsComponent;
  let fixture: ComponentFixture<CollectionDetailsComponent>;
  let collectionServiceMock: jasmine.SpyObj<CollectionService>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;

  // Mock data representing a collection
  const mockCollection = {
    id: 'col-123',
    name: 'Vintage Kurhn',
    description: 'A collection of classic Kurhn dolls from early 2000s.',
    dolls: [],
  };

  beforeEach(async () => {
    // Setup Service Mocks with Signals
    collectionServiceMock = jasmine.createSpyObj(
      'CollectionService',
      ['loadCollectionDolls'],
      {
        collections: signal([mockCollection]),
        dolls: signal([]),
        isLoading: signal(false),
        totalCount: signal(0),
        currentPage: signal(1),
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailsComponent);
    component = fixture.componentInstance;

    // Set the required input 'id'
    fixture.componentRef.setInput('id', 'col-123');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the collection name and description', () => {
    const header = fixture.debugElement.query(By.css('.catalog-header'));
    expect(header.nativeElement.textContent).toContain('Vintage Kurhn');
    expect(header.nativeElement.textContent).toContain(
      'A collection of classic Kurhn dolls',
    );
  });

  it('should show the loading spinner when service is loading and no dolls are present', () => {
    // Update signals via the mock properties
    (collectionServiceMock.isLoading as any).set(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('.initial-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should render doll cards when dolls are available', () => {
    const mockDolls = [
      { id: 'd1', base: { originalName: 'Doll 1' } },
      { id: 'd2', base: { originalName: 'Doll 2' } },
    ];

    (collectionServiceMock.dolls as any).set(mockDolls);
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('app-doll-card'));
    expect(cards.length).toBe(2);
  });

  it('should display empty state when no dolls are found and not loading', () => {
    (collectionServiceMock.dolls as any).set([]);
    (collectionServiceMock.isLoading as any).set(false);
    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState.nativeElement.textContent).toContain(
      'No dolls found matching these filters',
    );
  });

  it('should display "Collection not found" if the id does not match any collection', () => {
    fixture.componentRef.setInput('id', 'wrong-id');
    fixture.detectChanges();

    const mainContent = fixture.debugElement.nativeElement.textContent;
    expect(mainContent).toContain('Collection not found');
  });

  it('should toggle the filter panel based on UserspaceStateService', () => {
    (uiStateMock.isFilterOpen as any).set(true);
    fixture.detectChanges();

    const filterPanel = fixture.debugElement.query(By.css('app-filter-panel'));
    expect(filterPanel).toBeTruthy();
  });
});
