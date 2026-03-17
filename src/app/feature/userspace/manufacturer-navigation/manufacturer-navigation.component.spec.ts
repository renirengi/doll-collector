import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerNavigationComponent } from './manufacturer-navigation.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('ManufacturerNavigationComponent', () => {
  let component: ManufacturerNavigationComponent;
  let fixture: ComponentFixture<ManufacturerNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerNavigationComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have correct link for "All" button', () => {
    const allButton = fixture.debugElement.query(
      By.css('button'),
    ).nativeElement;

    expect(allButton.getAttribute('routerLink')).toBe('/catalog');
  });

  it('should render images for all manufacturers except Other', () => {
    const images = fixture.debugElement.queryAll(By.css('img'));
    const expectedCount = component.manufacturers.length - 1;
    expect(images.length).toBe(expectedCount);
  });
});
