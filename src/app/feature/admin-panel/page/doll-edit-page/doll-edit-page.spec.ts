import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DollEditPage } from './doll-edit-page';

describe('DollEditPage', () => {
  let component: DollEditPage;
  let fixture: ComponentFixture<DollEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollEditPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DollEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
