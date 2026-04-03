import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { UserComponent } from './user.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRoles } from '../../../../shared/models';

/**
 * Unit tests for UserComponent.
 * Validates user data display, menu toggling, and logout integration.
 */
describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: '123',
    username: 'johndoe',
    role: UserRoles.Client,
    email: 'john@example.com',
  } as User;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the user component', () => {
    expect(component).toBeTruthy();
  });

  describe('User Display Logic', () => {
    it('should display "Guest" when no user data is provided', () => {
      fixture.componentRef.setInput('userData', null);
      fixture.detectChanges();
      expect(component.displayName()).toBe('Guest');
    });

    it('should display the username when user data is present', () => {
      fixture.componentRef.setInput('userData', mockUser);
      fixture.detectChanges();
      expect(component.displayName()).toBe('johndoe');
    });

    it('should correctly identify admin role', () => {
      fixture.componentRef.setInput('userData', {
        ...mockUser,
        role: UserRoles.Admin,
      });
      fixture.detectChanges();
      expect(component.isAdmin()).toBeTrue();
    });

    it('should return false for isAdmin if user is a client', () => {
      fixture.componentRef.setInput('userData', {
        ...mockUser,
        role: UserRoles.Client,
      });
      fixture.detectChanges();
      expect(component.isAdmin()).toBeFalse();
    });
  });

  describe('Menu Interaction', () => {
    it('should have menu closed by default', () => {
      expect(component.menuOpen()).toBeFalse();
    });

    it('should toggle menuOpen signal when toggleMenu is called', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.toggleMenu(event);
      expect(component.menuOpen()).toBeTrue();
      expect(event.stopPropagation).toHaveBeenCalled();

      component.toggleMenu(event);
      expect(component.menuOpen()).toBeFalse();
    });

    it('should close menu when closeMenu is called', () => {
      component.menuOpen.set(true);
      component.closeMenu();
      expect(component.menuOpen()).toBeFalse();
    });

    it('should close menu on outside click via HostListener', () => {
      component.menuOpen.set(true);
      // Simulate document click
      document.dispatchEvent(new MouseEvent('click'));
      expect(component.menuOpen()).toBeFalse();
    });
  });

  describe('Auth Actions', () => {
    it('should call authService.logout and close menu when onLogout is triggered', () => {
      component.menuOpen.set(true);

      component.onLogout();

      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(component.menuOpen()).toBeFalse();
    });
  });
});
