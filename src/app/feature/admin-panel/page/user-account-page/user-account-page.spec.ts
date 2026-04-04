import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccountPage } from './user-account-page';

describe('UserAccountPage', () => {
  let component: UserAccountPage;
  let fixture: ComponentFixture<UserAccountPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccountPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
