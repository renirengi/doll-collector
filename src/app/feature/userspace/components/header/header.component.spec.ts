import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header.component';
import { provideRouter } from '@angular/router';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { signal } from '@angular/core';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', [], {
      currentUser: signal({ username: 'TestUser', avatar: null }),
    });

    const uiServiceMock = jasmine.createSpyObj(
      'UserspaceStateService',
      ['toggleFilters'],
      {
        totalDolls: signal(0),
        isFilterOpen: signal(false),
      },
    );

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserspaceStateService, useValue: uiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have access to user data from auth service', () => {
    const userData = (component as any).userData;
    expect(userData()).toEqual({ username: 'TestUser', avatar: null });
  });
});
