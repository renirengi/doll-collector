import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPageComponent } from './user-page.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserspaceStateService } from './service/userspace-state.service';
import { signal } from '@angular/core';

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser: signal({ username: 'TestUser' }),
      isAuthenticated: signal(true),
    });

    const uiServiceMock = jasmine.createSpyObj('UserspaceStateService', [], {
      totalDolls: signal(0),
      isFilterOpen: signal(false),
    });

    await TestBed.configureTestingModule({
      imports: [UserPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserspaceStateService, useValue: uiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the container with correct spacing class', () => {
    const container = fixture.nativeElement.querySelector(
      '.user-page-container',
    );
    expect(container).toBeTruthy();
    expect(container.classList).toContain('ml-[75px]');
  });
});
