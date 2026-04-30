import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFavoritesPage } from './user-favorites-page';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { OwnedDollService } from '../../../../core/services/owned-doll.service'; // Adjust path
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('UserFavoritesPage', () => {
  let component: UserFavoritesPage;
  let fixture: ComponentFixture<UserFavoritesPage>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;
  let ownedDollServiceMock: jasmine.SpyObj<OwnedDollService>;

  beforeEach(async () => {
    // Mocking the UI state service
    uiStateMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [UserFavoritesPage, NoopAnimationsModule],
      providers: [
        { provide: UserspaceStateService, useValue: uiStateMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFavoritesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
