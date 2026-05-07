import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPageComponent } from './user-page.component';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserspaceStateService } from './service/userspace-state.service';
import { CollectionService } from '../../core/services/collection.service';
import { signal, computed } from '@angular/core';
import { SidebarItem } from '../../shared/models';

class AuthServiceMock {
  currentUser = signal({ username: 'TestUser' });
  isAuthenticated = signal(true);
  logout() {}
}

class UserspaceStateServiceMock {
  totalDolls = signal(0);
  isFilterOpen = signal(false);
}

class CollectionServiceMock {
  public readonly menuItems = signal<SidebarItem[]>([
    { route: '/user/collections/1', iconClass: 'icon-custom', label: 'Custom' },
  ]);

  public readonly fullMenu = computed(() => {
    const staticMenu: SidebarItem[] = [
      {
        route: '/user/favorites',
        iconClass: 'icon-favorite',
        label: 'My wish',
      },
      { route: '/user/shelf', iconClass: 'icon-shelves', label: 'My shelf' },
      { route: '/user/shop', iconClass: 'icon-shop', label: 'My shop' },
      { route: '/user/sold-doll', iconClass: 'icon-sold-doll', label: 'Sold' },
    ];
    return [...staticMenu, ...this.menuItems()];
  });
}

describe('UserPageComponent', () => {
  let component: UserPageComponent;
  let fixture: ComponentFixture<UserPageComponent>;
  let collectionServiceMock: CollectionServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: UserspaceStateService, useClass: UserspaceStateServiceMock },
        { provide: CollectionService, useClass: CollectionServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPageComponent);
    component = fixture.componentInstance;

    collectionServiceMock = TestBed.inject(
      CollectionService,
    ) as unknown as CollectionServiceMock;

    fixture.detectChanges();
  });

  it('should create the layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should combine static menu and dynamic collections from service', () => {
    const items = component.sidebarItems();

    expect(items.length).toBe(5);
    expect(items[0].label).toBe('My wish');
    expect(items[4].label).toBe('Custom');
  });

  it('should update sidebarItems when collection service menuItems change', () => {
    const newItems: SidebarItem[] = [
      { route: '/user/collections/2', iconClass: 'icon-new', label: 'New Col' },
    ];

    collectionServiceMock.menuItems.set(newItems);
    fixture.detectChanges();
    const items = component.sidebarItems();

    expect(items.length).toBe(5);
    expect(items[4].label).toBe('New Col');
  });

  it('should render app-sidebar with items', () => {
    const sidebar = fixture.nativeElement.querySelector('app-sidebar');
    expect(sidebar).toBeTruthy();
  });
});
