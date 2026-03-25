import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserShelfPage } from './user-shelf-page';

describe('UserShelfPage', () => {
  let component: UserShelfPage;
  let fixture: ComponentFixture<UserShelfPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserShelfPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserShelfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
