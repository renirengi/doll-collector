import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerDetailsComponent } from './manufacturer-details.component';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('ManufacturerDetailsComponent', () => {
  let component: ManufacturerDetailsComponent;
  let fixture: ComponentFixture<ManufacturerDetailsComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailsComponent],
      providers: [
        // Настраиваем роутер с пустым маршрутом для тестов
        provideRouter([
          { path: '**', component: ManufacturerDetailsComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ManufacturerDetailsComponent);
    component = fixture.componentInstance;

    // Начальная инициализация
    fixture.detectChanges();
  });

  /**
   * Используем реальный метод навигации.
   * navigateByUrl обновляет всё дерево роутера правильно.
   */
  async function simulateNavigation(url: string) {
    await router.navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute manufacturerName from query params', async () => {
    await simulateNavigation('/catalog?manufacturer=Mattel&brand=Barbie');
    expect(component.manufacturerName()).toBe('Mattel');
  });

  it('should compute correct brands based on manufacturer', async () => {
    await simulateNavigation('/catalog?manufacturer=Mattel');
    const brands = component.brands();
    expect(brands).toEqual(['Barbie', 'Monster High']);
  });

  it('should render brand buttons with correct image paths', async () => {
    await simulateNavigation('/catalog?manufacturer=Mattel');
    const images = fixture.debugElement.queryAll(By.css('img.nav-logo'));
    expect(images.length).toBeGreaterThan(0);

    const firstImg = images[0].nativeElement as HTMLImageElement;
    expect(firstImg.src).toContain('assets/brands/Barbie.png');
  });

  it('should apply "active" class to current brand button', async () => {
    await simulateNavigation('/catalog?manufacturer=Mattel&brand=Barbie');
    const activeButton = fixture.debugElement.query(By.css('.nav-btn.active'));
    expect(activeButton).not.toBeNull();

    const img = activeButton.query(By.css('img'));
    expect(img.nativeElement.alt).toBe('Barbie');
  });

  it('should update buttons when manufacturer changes', async () => {
    await simulateNavigation('/catalog?manufacturer=Kurhn');
    expect(component.brands()).toEqual(['Kurhn', 'Sonya Rose']);

    const buttons = fixture.debugElement.queryAll(By.css('.nav-btn'));
    expect(buttons.length).toBe(2);
  });

  it('should handle "Other" manufacturer', async () => {
    await simulateNavigation('/catalog?manufacturer=Other');
    const brands = component.brands();
    expect(brands).toContain('Other');
    expect(brands).toContain('Sandra');
  });

  it('should be hidden if manufacturer is unknown', async () => {
    await simulateNavigation('/catalog?manufacturer=Unknown');
    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeNull();
  });
});
