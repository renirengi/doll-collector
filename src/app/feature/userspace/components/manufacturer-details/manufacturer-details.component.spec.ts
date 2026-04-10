import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { ManufacturerDetailsComponent } from './manufacturer-details.component';

describe('ManufacturerDetailsComponent', () => {
  let component: ManufacturerDetailsComponent;
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailsComponent],
      providers: [
        provideRouter([
          { path: 'catalog', component: ManufacturerDetailsComponent },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  async function createComponent(queryParams: any = {}) {
    const urlTree = router.createUrlTree(['/catalog'], { queryParams });
    const url = router.serializeUrl(urlTree);

    component = await harness.navigateByUrl(url, ManufacturerDetailsComponent);
    harness.detectChanges();
  }

  it('should be empty when no manufacturers selected', async () => {
    await createComponent({});
    expect(component.availableBrands()).toEqual([]);
  });

  it('should show brands for single manufacturer', async () => {
    await createComponent({ manufacturer: 'Mattel' });
    expect(component.availableBrands()).toEqual(['Barbie', 'Monster High']);
  });

  it('should merge unique brands for multiple manufacturers', async () => {
    await createComponent({ manufacturer: ['Mattel', 'Simba Toys'] });
    const brands = component.availableBrands();
    expect(brands).toContain('Barbie');
    expect(brands).toContain('Steffi Love');
    expect(brands.length).toBe(3);
  });

  it('should toggleBrand add new brand to array', async () => {
    await createComponent({ brand: 'Barbie' });
    const result = component.toggleBrand('Monster High');
    expect(result).toEqual(['Barbie', 'Monster High']);
  });

  it('should toggleBrand remove existing brand', async () => {
    await createComponent({ brand: ['Barbie', 'Monster High'] });
    const result = component.toggleBrand('Barbie');
    expect(result).toEqual(['Monster High']);
  });

  it('should return null if toggleBrand removes last brand', async () => {
    await createComponent({ brand: 'Barbie' });
    const result = component.toggleBrand('Barbie');
    expect(result).toBeNull();
  });

  it('should correctly detect if brand is selected', async () => {
    await createComponent({ brand: ['Barbie', 'Kurhn'] });
    expect(component.isBrandSelected('Barbie')).toBeTrue();
    expect(component.isBrandSelected('Monster High')).toBeFalse();
  });

  it('should handle duplicate brands in registry by returning unique set', async () => {
    await createComponent({ manufacturer: ['Spin Master', 'Jakks Pacific'] });
    const brands = component.availableBrands();
    const counts = brands.filter((b) => b === 'Disney ILY 4ever').length;
    expect(counts).toBe(1);
  });
});
