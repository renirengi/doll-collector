import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManufacturerNavigationComponent } from './manufacturer-navigation.component';


describe('ManufacturerNavigation', () => {
  let component: ManufacturerNavigationComponent;
  let fixture: ComponentFixture<ManufacturerNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerNavigationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturerNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
