import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserShopPage } from './user-shop-page';

describe('UserShopPage', () => {
  let component: UserShopPage;
  let fixture: ComponentFixture<UserShopPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserShopPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
