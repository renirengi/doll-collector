import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { SortValue } from '../../../../shared/models';

type SelectValue = string | string[] | SortValue | null;

@Component({
  selector: 'app-doll-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDividerModule,
    TitleCasePipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DollSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './doll-select.component.html',
  styleUrls: ['./doll-select.component.scss'],
})
export class DollSelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() options: string[] | null = null;
  @Input() isSort = false;
  @Input() isUserspace = false;
  @Output() changed = new EventEmitter<void>();

  public readonly control = new FormControl<SelectValue>(null);

  private onChange: (value: SelectValue) => void = () => {};
  private onTouched: () => void = () => {};

  public compareObjects(o1: any, o2: any): boolean {
    if (o1 === o2) return true;
    if (o1 && o2 && typeof o1 === 'object' && typeof o2 === 'object') {
      return o1.field === o2.field && o1.order === o2.order;
    }
    return false;
  }

  public writeValue(val: SelectValue): void {
    this.control.setValue(val, { emitEvent: false });
  }

  public registerOnChange(fn: (value: SelectValue) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  public onSelectionChange(): void {
    const value = this.control.value;
    this.onChange(value);
    this.onTouched();
    this.changed.emit();
  }

  public get selectedLabel(): string {
    const val = this.control.value;
    if (Array.isArray(val)) {
      return val.length > 0 ? val[0] : '';
    }
    return typeof val === 'string' ? val : '';
  }
}
