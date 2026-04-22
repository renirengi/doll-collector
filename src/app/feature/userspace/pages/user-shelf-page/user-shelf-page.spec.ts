import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserShelfPage } from './user-shelf-page';
import { OwnedDollService } from '../../../../core/services/owned-doll.service';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal, WritableSignal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserDoll, OwnedDollSortAndFilterDto } from '../../../../shared/models';

describe('UserShelfPage', () => {
  let component: UserShelfPage;
  let fixture: ComponentFixture<UserShelfPage>;

  let ownedDollServiceMock: jasmine.SpyObj<OwnedDollService>;
  let uiServiceMock: jasmine.SpyObj<UserspaceStateService>;
  let collectionServiceMock: jasmine.SpyObj<CollectionService>;

  const queryParamsSubject = new BehaviorSubject({});

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
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
          },
        },
        { provide: OwnedDollService, useValue: ownedDollServiceMock },
        { provide: UserspaceStateService, useValue: uiServiceMock },
        { provide: CollectionService, useValue: collectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserShelfPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load shelf on initialization with empty params', () => {
    fixture.detectChanges();
    expect(ownedDollServiceMock.loadShelf).toHaveBeenCalled();
  });

  it('should sync filters and reload when queryParams change', () => {
    fixture.detectChanges();

    queryParamsSubject.next({ brand: 'Mattel' });

    expect(ownedDollServiceMock.loadShelf).toHaveBeenCalledWith(
      jasmine.objectContaining({
        filterCriteria: jasmine.objectContaining({
          base: jasmine.objectContaining({
            brand: ['Mattel'],
          }),
        }),
      }),
      1,
    );
  });

  it('should render correct number of doll cards', () => {
    const mockDolls = [
      { id: '1', base: { id: 'b1', originalName: 'Doll 1' } },
    ] as UserDoll[];

    (ownedDollServiceMock.dolls as WritableSignal<UserDoll[]>).set(mockDolls);

    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-doll-card');
    expect(cards.length).toBe(1);
  });
});
