import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DollCatalogComponent } from './doll-catalog.component';

describe('DollCatalog', () => {
  let component: DollCatalogComponent;
  let fixture: ComponentFixture<DollCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DollCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
