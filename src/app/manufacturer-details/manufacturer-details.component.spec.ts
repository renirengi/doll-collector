import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerDetailsComponent } from './manufacturer-details.component';
import { DollService } from '../core/services/dollService';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

class MockDollService {
  public dolls = signal([]);
  public isLoading = signal(false);
}

describe('ManufacturerDetailsComponent', () => {
  let component: ManufacturerDetailsComponent;
  let fixture: ComponentFixture<ManufacturerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailsComponent],
      providers: [
        { provide: DollService, useClass: MockDollService },
        provideRouter([
          {
            path: 'catalog/:manufacturer',
            component: ManufacturerDetailsComponent,
          },
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { manufacturer: 'Kurhn' },
            },
          },
        },
        provideAnimationsAsync('noop'),
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
    expect(component.manufacturerName()).toBe('Kurhn');
  });

  it('should compute correct brands based on manufacturer', () => {
    const brands = component.brands();
    expect(brands).toEqual(['Kurhn', 'Sonya Rose']);
  });

  it('should render brand buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('.brand-chip');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Kurhn');
  });
});
