import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserShopPage } from './user-shop-page';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('UserShopPage', () => {
  let component: UserShopPage;
  let fixture: ComponentFixture<UserShopPage>;
  let uiStateMock: jasmine.SpyObj<UserspaceStateService>;

  beforeEach(async () => {
    // 1. Mock only the service explicitly injected in the component
    uiStateMock = jasmine.createSpyObj('UserspaceStateService', [], {
      isFilterOpen: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [UserShopPage, NoopAnimationsModule],
      providers: [
        // 2. Standard Angular providers to handle background HttpClient dependencies
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserspaceStateService, useValue: uiStateMock },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ category: 'new-arrivals' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the shop page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the shop-specific header title', () => {
    const h1 = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(h1.textContent).toContain('My shop');
  });

  it('should initialize the params signal from the route', () => {
    // Verifies that the toSignal wrapper is working with the mocked route
    expect(component['params']()).toEqual({ category: 'new-arrivals' });
  });

  it('should display the initial progress spinner', () => {
    const spinner = fixture.debugElement.query(By.css('mat-progress-spinner'));
    expect(spinner).toBeTruthy();
  });
});
