import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarItem } from '../../../shared/models';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  const mockItems: SidebarItem[] = [
    { route: '/user/favorites', iconClass: 'icon-favorite', label: 'My wish' },
    {
      route: '/user/collections/1',
      icon: 'assets/icons/diamond_blue.svg',
      label: 'Custom',
      iconClass: '',
    },
    { route: '/user/other', label: 'Other', iconClass: '' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();
  });

  it('should render all items', () => {
    const items = fixture.debugElement.queryAll(By.css('li'));
    expect(items.length).toBe(3);
  });

  it('should have correct tooltip message and position', () => {
    const tooltipDebug = fixture.debugElement.query(By.directive(MatTooltip));
    const tooltip = tooltipDebug.injector.get(MatTooltip);

    expect(tooltip.message).toBe('My wish');
    expect(tooltip.position).toBe('right');
  });

  it('should use iconClass when icon is missing', () => {
    const icon = fixture.debugElement.queryAll(By.css('.icon'))[0]
      .nativeElement;
    expect(icon.classList).toContain('icon-favorite');
  });

  it('should parse icon path correctly', () => {
    const icon = fixture.debugElement.queryAll(By.css('.icon'))[1]
      .nativeElement;
    expect(icon.classList).toContain('icon-diamond-blue');
  });

  it('should fallback to icon-crown', () => {
    const icon = fixture.debugElement.queryAll(By.css('.icon'))[2]
      .nativeElement;
    expect(icon.classList).toContain('icon-crown');
  });

  it('should apply variantClass', () => {
    const aside = fixture.debugElement.query(By.css('aside')).nativeElement;
    expect(aside.className).toContain('user-sidebar');

    fixture.componentRef.setInput('variantClass', 'test-class');
    fixture.detectChanges();
    expect(aside.className).toContain('test-class');
  });

  it('should have valid routerLink', () => {
    const link = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(link.getAttribute('href')).toBe('/user/favorites');
  });
});
