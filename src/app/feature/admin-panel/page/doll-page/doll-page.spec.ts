import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DollPage } from './doll-page';

describe('DollPage', () => {
  let component: DollPage;
  let fixture: ComponentFixture<DollPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
