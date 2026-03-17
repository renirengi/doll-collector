import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerDetailsComponent } from './manufacturer-details.component';

describe('ManufacturerDetails', () => {
  let component: ManufacturerDetailsComponent;
  let fixture: ComponentFixture<ManufacturerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManufacturerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
