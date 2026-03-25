import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCardComponent } from './doll-card.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('DollCardComponent', () => {
  let component: DollCardComponent;
  let fixture: ComponentFixture<DollCardComponent>;

  const mockDoll = {
    id: 1,
    originalName: 'Classic Barbie',
    manufacturer: 'Mattel',
    brand: 'Barbie',
    series: 'Fashionistas',
    releaseYear: 2023,
    image: 'barbie.png',
    description: 'Lovely doll',
  } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollCardComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DollCardComponent);
    component = fixture.componentInstance;

    component.doll = mockDoll;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display doll name', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const nameElement = compiled.querySelector('.doll-name');

    expect(nameElement).toBeTruthy();
    expect(nameElement?.textContent?.trim()).toBe('Classic Barbie');
  });

  it('should display correct brand label', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const brandElement = compiled.querySelector('.brand-label');

    expect(brandElement?.textContent?.trim()).toBe('Barbie');
  });

  it('should log message on click', () => {
    const spy = spyOn(console, 'log');

    component.onCardClick();
    expect(spy).toHaveBeenCalledWith('Клик по кукле:', 'Classic Barbie');
  });
});
