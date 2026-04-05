import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPanelComponent } from './admin-panel.component';
import { Sidebar } from '../../core/components/sidebar/sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('AdminPanelComponent', () => {
  let component: AdminPanelComponent;
  let fixture: ComponentFixture<AdminPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass correct menu items to app-sidebar', () => {
    const sidebarDebugElement = fixture.debugElement.query(
      By.directive(Sidebar),
    );
    const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;

    expect(sidebarInstance.items()).toEqual(component.adminMenu);
  });

  it('should pass admin-sidebar variant class to sidebar', () => {
    const sidebarDebugElement = fixture.debugElement.query(
      By.directive(Sidebar),
    );
    const sidebarInstance = sidebarDebugElement.componentInstance as Sidebar;

    expect(sidebarInstance.variantClass()).toBe('admin-sidebar');
  });

  it('should render router-outlet with correct margin class', () => {
    const routerOutlet = fixture.debugElement.query(
      By.css('router-outlet'),
    ).nativeElement;
    expect(routerOutlet.classList).toContain('ml-[75px]');
  });

  it('should have 5 items in adminMenu', () => {
    expect(component.adminMenu.length).toBe(5);
  });

  it('should have correct path for the last menu item (exit)', () => {
    const exitItem = component.adminMenu.find(
      (item) => item.iconClass === 'exit',
    );
    expect(exitItem?.path).toBe('/user/catalog');
  });
});
