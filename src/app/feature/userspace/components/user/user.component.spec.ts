import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserComponent } from './user.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { User, UserRoles } from '../../../../shared/models';
import { signal } from '@angular/core';

class AuthServiceMock {
  logout() {}
}

class CollectionServiceMock {
  menuItems = signal([]);
  createCollection() {
    return Promise.resolve({});
  }
}

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let authService: AuthService;

  const mockUser: User = {
    id: '123',
    username: 'johndoe',
    role: UserRoles.Client,
    email: 'john@example.com',
  } as User;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: CollectionService, useClass: CollectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('User Display Logic', () => {
    it('should display "Guest" when no user data', () => {
      fixture.componentRef.setInput('userData', null);
      expect(component.displayName()).toBe('Guest');
    });

    it('should display username', () => {
      fixture.componentRef.setInput('userData', mockUser);
      expect(component.displayName()).toBe('johndoe');
    });

    it('should correctly identify admin', () => {
      fixture.componentRef.setInput('userData', {
        ...mockUser,
        role: UserRoles.Admin,
      });
      expect(component.isAdmin()).toBeTrue();
    });
  });

  describe('Menu Interaction', () => {
    it('should toggle menu', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      component.toggleMenu(event);
      expect(component.menuOpen()).toBeTrue();
      expect(event.stopPropagation).toHaveBeenCalled();

      component.toggleMenu(event);
      expect(component.menuOpen()).toBeFalse();
    });

    it('should close menu on outside click', () => {
      component.menuOpen.set(true);
      component.onOutsideClick();
      expect(component.menuOpen()).toBeFalse();
    });
  });

  describe('Actions', () => {
    it('should call logout and close menu', () => {
      const spy = spyOn(authService, 'logout');
      component.menuOpen.set(true);

      component.onLogout();

      expect(spy).toHaveBeenCalled();
      expect(component.menuOpen()).toBeFalse();
    });

    it('should handle openCreateModal', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.menuOpen.set(true);

      const modalMock = { showModal: jasmine.createSpy('showModal') };
      spyOn(component as any, 'createCollectionModal').and.returnValue(
        modalMock,
      );

      component.openCreateModal(event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.menuOpen()).toBeFalse();
      expect(modalMock.showModal).toHaveBeenCalled();
    });
  });
});
