import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';

import { DollSelectComponent } from './doll-select.component';
import { SortValue } from '../../../../shared/models';

describe('DollSelectComponent', () => {
  let component: DollSelectComponent;
  let fixture: ComponentFixture<DollSelectComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DollSelectComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DollSelectComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Logic and Getters', () => {
    it('should return string for selectedLabel', () => {
      component.control.setValue('standard');
      expect(component.selectedLabel).toBe('standard');
    });

    it('should return null for selectedLabel when value is SortValue', () => {
      component.control.setValue({ field: 'releaseYear', order: 'DESC' });
      expect(component.selectedLabel).toBeNull();
    });

    it('should correctly compare SortValue objects', () => {
      const val1: SortValue = { field: 'price', order: 'ASC' };
      const val2: SortValue = { field: 'price', order: 'ASC' };
      const val3: SortValue = { field: 'price', order: 'DESC' };

      expect(component.compareObjects(val1, val2)).toBeTrue();
      expect(component.compareObjects(val1, val3)).toBeFalse();
    });

    it('should correctly compare strings', () => {
      expect(component.compareObjects('a', 'a')).toBeTrue();
      expect(component.compareObjects('a', 'b')).toBeFalse();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should update control value on writeValue', () => {
      component.writeValue('test');
      expect(component.control.value).toBe('test');
    });

    it('should call onChange on selection change', () => {
      const spy = jasmine.createSpy('onChange');
      component.registerOnChange(spy);
      component.control.setValue('new');
      component.onSelectionChange();
      expect(spy).toHaveBeenCalledWith('new');
    });

    it('should emit changed event on selection change', () => {
      const spy = spyOn(component.changed, 'emit');
      component.onSelectionChange();
      expect(spy).toHaveBeenCalled();
    });

    it('should disable control', () => {
      component.setDisabledState(true);
      expect(component.control.disabled).toBeTrue();
    });
  });
});
