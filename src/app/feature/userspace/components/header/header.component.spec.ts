import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header.component';
import { provideRouter } from '@angular/router';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CollectionService } from '../../../../core/services/collection.service';
import { signal } from '@angular/core';

class AuthServiceMock {
  currentUser = signal({ username: 'TestUser', avatar: null });
}

class UserspaceStateServiceMock {
  totalDolls = signal(0);
  isFilterOpen = signal(false);
  toggleFilters() {}
}

class CollectionServiceMock {
  menuItems = signal([]);
  createCollection() {
    return Promise.resolve({});
  }
}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: UserspaceStateService, useClass: UserspaceStateServiceMock },
        { provide: CollectionService, useClass: CollectionServiceMock },
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
