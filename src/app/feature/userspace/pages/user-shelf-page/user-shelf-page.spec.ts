import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserShelfPage } from './user-shelf-page';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { UserDoll, OwnedDollSortAndFilterDto } from '../../../../shared/models';

describe('UserShelfPage', () => {
  let component: UserShelfPage;
  let fixture: ComponentFixture<UserShelfPage>;

  /** * Mocks for required services
   */
  let ownedDollServiceMock: jasmine.SpyObj<OwnedDollService>;
  let uiServiceMock: jasmine.SpyObj<UserspaceStateService>;
  let collectionServiceMock: jasmine.SpyObj<CollectionService>;

  beforeEach(async () => {
    ownedDollServiceMock = jasmine.createSpyObj(
      'OwnedDollService',
      ['loadShelf'],
      {
        dolls: signal<UserDoll[]>([]),
        totalCount: signal(0),
        isLoading: signal(false),
        currentPage: signal(1),
        currentCriteria: signal<OwnedDollSortAndFilterDto>({
          filterCriteria: {},
          sortCriteria: {
            ownedDollSortBy: 'createdAt',
            ownedDollSortOrder: 'DESC',
          },
        }),
      },
    );

    uiServiceMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
    });

    collectionServiceMock = jasmine.createSpyObj('CollectionService', [], {
      menuItems: signal([]),
    });

    await TestBed.configureTestingModule({
      imports: [UserShelfPage, NoopAnimationsModule],
      providers: [
        /** satisfying HttpClient and Router dependencies */
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),

        /** Providing mocked services */
        { provide: OwnedDollService, useValue: ownedDollServiceMock },
        { provide: UserspaceStateService, useValue: uiServiceMock },
        { provide: CollectionService, useValue: collectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserShelfPage);
    component = fixture.componentInstance;
  });

  /**
   * @test verifies successful creation with all dependencies satisfied
   */
  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**
   * @test verifies card rendering logic
   */
  it('should render correct number of doll cards', () => {
    const mockDolls = [
      { id: '1', base: { id: 'b1', originalName: 'Doll 1' } },
    ] as UserDoll[];
    (ownedDollServiceMock.dolls as any).set(mockDolls);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-doll-card');
    expect(cards.length).toBe(1);
  });
});
