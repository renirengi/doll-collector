import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { ManufacturerNavigationComponent } from './manufacturer-navigation.component';

describe('ManufacturerNavigationComponent', () => {
  let component: ManufacturerNavigationComponent;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerNavigationComponent],
      providers: [
        provideRouter([
          { path: 'catalog', component: ManufacturerNavigationComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  async function createComponent(queryParams: any = {}) {
    const urlTree = router.createUrlTree(['/catalog'], { queryParams });
    const url = router.serializeUrl(urlTree);
    component = await harness.navigateByUrl(
      url,
      ManufacturerNavigationComponent,
    );
    harness.detectChanges();
  }

  it('should have All button active when no selection', async () => {
    await createComponent({});
    expect(component['selectedManufacturers']()).toEqual([]);
    const allBtn =
      harness.routeNativeElement?.querySelector('.text-btn.active');
    expect(allBtn?.textContent).toContain('All');
  });

  it('should identify selected manufacturers from URL', async () => {
    await createComponent({ manufacturer: ['Mattel', 'Kurhn'] });
    expect(component.isSelected('Mattel')).toBeTrue();
    expect(component.isSelected('Kurhn')).toBeTrue();
    expect(component.isSelected('Hasbro')).toBeFalse();
  });

  it('should toggleSelection add manufacturer to empty list', async () => {
    await createComponent({});
    const result = component.toggleSelection('Mattel');
    expect(result).toEqual(['Mattel']);
  });

  it('should toggleSelection remove existing manufacturer', async () => {
    await createComponent({ manufacturer: ['Mattel', 'Kurhn'] });
    const result = component.toggleSelection('Mattel');
    expect(result).toEqual(['Kurhn']);
  });

  it('should return null when last manufacturer is toggled off', async () => {
    await createComponent({ manufacturer: 'Mattel' });
    const result = component.toggleSelection('Mattel');
    expect(result).toBeNull();
  });

  it('should handle single manufacturer as array via toSignal', async () => {
    await createComponent({ manufacturer: 'Mattel' });
    expect(Array.isArray(component['selectedManufacturers']())).toBeTrue();
    expect(component['selectedManufacturers']()).toEqual(['Mattel']);
  });

  it('should render correct number of manufacturer buttons plus All button', async () => {
    await createComponent({});
    const buttons = harness.routeNativeElement?.querySelectorAll('.nav-btn');
    expect(buttons?.length).toBe(component.manufacturers.length + 1);
  });
});
