import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerDetailsComponent } from './manufacturer-details.component';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ManufacturerDetailsComponent', () => {
  let component: ManufacturerDetailsComponent;
  let fixture: ComponentFixture<ManufacturerDetailsComponent>;
  let paramsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    paramsSubject = new BehaviorSubject({ manufacturer: 'Mattel', brand: 'Barbie' });

    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: paramsSubject.asObservable(),
            snapshot: { params: paramsSubject.value }
          },
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute manufacturerName from route params', () => {
    expect(component.manufacturerName()).toBe('Mattel');
  });

  it('should compute correct brands based on manufacturer', () => {
    const brands = component.brands();
    expect(brands).toEqual(['Barbie', 'Monster High']);
  });

  it('should render brand buttons with correct image paths', () => {
    const images = fixture.debugElement.queryAll(By.css('img.nav-logo'));
    expect(images.length).toBeGreaterThan(0);
    const firstImg = images[0].nativeElement as HTMLImageElement;
    expect(firstImg.src).toContain('assets/brands/Barbie.png');
  });

  it('should apply "active" class to current brand button', () => {
    const activeButton = fixture.debugElement.query(By.css('.nav-btn.active'));
    expect(activeButton).not.toBeNull();

    const img = activeButton.query(By.css('img'));
    if (img) {
      expect((img.nativeElement as HTMLImageElement).alt).toBe('Barbie');
    } else {
      expect(activeButton.nativeElement.textContent).toContain('Barbie');
    }
  });

  it('should update buttons when manufacturer changes', () => {
    paramsSubject.next({ manufacturer: 'Kurhn', brand: 'Kurhn' });
    fixture.detectChanges();

    expect(component.brands()).toEqual(['Kurhn', 'Sonya Rose']);
    const buttons = fixture.debugElement.queryAll(By.css('.nav-btn'));
    expect(buttons.length).toBe(2);
  });

  it('should handle "Other" manufacturer and its brands', () => {
    paramsSubject.next({ manufacturer: 'Other', brand: 'Other' });
    fixture.detectChanges();

    const brands = component.brands();
    expect(brands).toEqual(['Other', 'Sandra']);

    const otherBtn = fixture.debugElement.query(By.css('.nav-btn.active'));
    expect(otherBtn.nativeElement.textContent).toContain('Other');
  });

  it('should be hidden if manufacturer is unknown', () => {
    paramsSubject.next({ manufacturer: 'Unknown', brand: '' });
    fixture.detectChanges();

    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeNull();
  });
});
