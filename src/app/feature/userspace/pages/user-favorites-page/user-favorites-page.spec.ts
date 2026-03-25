import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFavoritesPage } from './user-favorites-page';

describe('UserFavoritesPage', () => {
  let component: UserFavoritesPage;
  let fixture: ComponentFixture<UserFavoritesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFavoritesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFavoritesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
