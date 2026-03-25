import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSoldDollPage } from './user-sold-doll-page';

describe('UserSoldDollPage', () => {
  let component: UserSoldDollPage;
  let fixture: ComponentFixture<UserSoldDollPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSoldDollPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSoldDollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
