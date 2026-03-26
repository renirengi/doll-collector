import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header.component';
import { provideRouter } from '@angular/router';
import { UserspaceStateService } from '../../service/userspace-state.service';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([]),
        {
          provide: UserspaceStateService,
          useValue: {
            totalDolls: () => 0,
            isFilterOpen: () => false,
            toggleFilters: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
