import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLogPage } from './event-log-page';

describe('EventLogPage', () => {
  let component: EventLogPage;
  let fixture: ComponentFixture<EventLogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventLogPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
