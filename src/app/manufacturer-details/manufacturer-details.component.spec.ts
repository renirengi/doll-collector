import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerDetails } from './manufacturer-details.component';

describe('ManufacturerDetails', () => {
  let component: ManufacturerDetails;
  let fixture: ComponentFixture<ManufacturerDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturerDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
