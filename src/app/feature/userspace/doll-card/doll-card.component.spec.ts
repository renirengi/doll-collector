import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DollCardComponent } from './doll-card.component';

describe('DollCard', () => {
  let component: DollCardComponent;
  let fixture: ComponentFixture<DollCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DollCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
