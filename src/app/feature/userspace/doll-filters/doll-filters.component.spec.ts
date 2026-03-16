import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DollFiltersComponent } from './doll-filters.component';

describe('DollFilters', () => {
  let component: DollFiltersComponent;
  let fixture: ComponentFixture<DollFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DollFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
