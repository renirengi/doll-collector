import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSoldDollPage } from './user-sold-doll-page';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('UserSoldDollPage', () => {
  let component: UserSoldDollPage;
  let fixture: ComponentFixture<UserSoldDollPage>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;

  beforeEach(async () => {
    // 1. Mock only the service explicitly injected in the component
    uiStateMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [UserSoldDollPage, NoopAnimationsModule],
      providers: [
        // 2. Add HttpClient infrastructure for child components (FilterPanel etc.)
        provideHttpClient(),
        provideHttpClientTesting(),

        // 3. Provide the mocked UI state
        { provide: UserspaceStateService, useValue: uiStateMock },

        // 4. Fix for NG0201: Provide the ActivatedRoute mock
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}), // Mock empty query params
            params: of({}), // Mock empty route params if needed
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSoldDollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
