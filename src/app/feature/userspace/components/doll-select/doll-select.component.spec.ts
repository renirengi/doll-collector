import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DollSelectComponent } from './doll-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { TitleCasePipe } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('DollSelectComponent', () => {
  let component: DollSelectComponent;
  let fixture: ComponentFixture<DollSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DollSelectComponent,
        ReactiveFormsModule,
        MatSelectModule,
        MatDividerModule,
        NoopAnimationsModule,
        TitleCasePipe,
      ],
    }).compileComponents();
  });

  const createComponent = (isSort = false, options: string[] = []) => {
    fixture = TestBed.createComponent(DollSelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isSort', isSort);
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
  };

  describe('Multiple Selection Mode (isSort = false)', () => {
    // We provide options to ensure mat-select can match the values
    beforeEach(() => createComponent(false, ['kurhn', 'barbie', 'licca']));

    it('should show "Selected: 2" when more than 1 item is selected', fakeAsync(() => {
      // Act: Set value and wait for change detection and internal Material timers
      component.control.setValue(['kurhn', 'barbie']);
      fixture.detectChanges();
      tick(); // Let Material's internal overlay/trigger logic stabilize
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('.mat-mdc-select-trigger'),
      ).nativeElement;

      // Assert
      expect(trigger.textContent).toContain('Selected: 2');
    }));

    it('should show titlecased label when exactly 1 item is selected', fakeAsync(() => {
      // Act
      component.control.setValue(['kurhn']);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('.mat-mdc-select-trigger'),
      ).nativeElement;

      // Assert
      expect(trigger.textContent).toContain('Kurhn');
    }));

    it('should show "Not selected" when value is null or empty', fakeAsync(() => {
      component.control.setValue([]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('.mat-mdc-select-trigger'),
      ).nativeElement;
      expect(trigger.textContent).toContain('Not selected');
    }));
  });

  describe('Sort Mode (isSort = true)', () => {
    beforeEach(() => createComponent(true));

    it('should show "Sorted" in trigger when sort value is present', fakeAsync(() => {
      component.control.setValue({ field: 'releaseYear', order: 'DESC' });
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const trigger = fixture.debugElement.query(
        By.css('.mat-mdc-select-trigger'),
      ).nativeElement;
      expect(trigger.textContent).toContain('Sorted');
    }));
  });
});
