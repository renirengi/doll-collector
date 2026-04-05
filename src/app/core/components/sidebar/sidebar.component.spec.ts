import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  const mockItems = [{ path: 'home', iconClass: 'icon-home', label: 'Home' }];

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

  it('should have matTooltip with correct label', () => {
    const tooltipDebugElement = fixture.debugElement.query(
      By.directive(MatTooltip),
    );
    const tooltipInstance = tooltipDebugElement.injector.get(MatTooltip);

    expect(tooltipInstance.message).toBe('Home');
  });

  it('should have correct tooltip position', () => {
    const tooltipDebugElement = fixture.debugElement.query(
      By.directive(MatTooltip),
    );
    const tooltipInstance = tooltipDebugElement.injector.get(MatTooltip);

    expect(tooltipInstance.position).toBe('right');
  });
});
