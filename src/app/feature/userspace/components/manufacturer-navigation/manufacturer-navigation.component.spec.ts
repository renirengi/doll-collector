import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerNavigationComponent } from './manufacturer-navigation.component';
import { provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('ManufacturerNavigationComponent', () => {
  let component: ManufacturerNavigationComponent;
  let fixture: ComponentFixture<ManufacturerNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerNavigationComponent],
      providers: [
        provideRouter([
          { path: 'catalog', component: ManufacturerNavigationComponent }
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have correct link for "All" button', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const allButtonDe = fixture.debugElement.queryAll(By.css('.text-btn'))
      .find(de => de.nativeElement.textContent.trim() === 'All');

    expect(allButtonDe).toBeTruthy('Button "All" was not found');

    const link = allButtonDe?.injector.get(RouterLink);

    expect(link?.queryParams).toEqual(jasmine.objectContaining({
      manufacturer: null,
      brand: null
    }));
  });

  it('should have correct query params for manufacturer buttons', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const kurhnImg = fixture.debugElement.query(By.css('img[alt="Kurhn"]'));
    expect(kurhnImg).toBeTruthy('Kurhn logo image was not found');

    const kurhnButtonDe = kurhnImg.parent;
    const link = kurhnButtonDe?.injector.get(RouterLink);

    expect(link?.queryParams).toEqual(jasmine.objectContaining({
      manufacturer: 'Kurhn',
      brand: null
    }));
  });

  it('should render "Other" as a text button', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const otherButton = fixture.debugElement.queryAll(By.css('.text-btn'))
      .find(de => de.nativeElement.textContent.trim() === 'Other');

    expect(otherButton).toBeTruthy('Button "Other" should be a text button');

    const link = otherButton?.injector.get(RouterLink);
    expect(link?.queryParams).toEqual(jasmine.objectContaining({
      manufacturer: 'Other'
    }));
  });
});
