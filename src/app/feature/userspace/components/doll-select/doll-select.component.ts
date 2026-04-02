import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { SortValue } from '../../../../shared/models';

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

  public readonly control = new FormControl<string | SortValue | null>(null);

  private onChange: (value: string | SortValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  public compareObjects(
    o1: string | SortValue | null,
    o2: string | SortValue | null,
  ): boolean {
    if (o1 === o2) return true;

    if (o1 && o2 && typeof o1 === 'object' && typeof o2 === 'object') {
      return o1.field === o2.field && o1.order === o2.order;
    }

    return false;
  }

  public writeValue(val: string | SortValue | null): void {
    this.control.setValue(val, { emitEvent: false });
  }

  public registerOnChange(
    fn: (value: string | SortValue | null) => void,
  ): void {
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

  public get selectedLabel(): string | null {
    const val = this.control.value;
    return typeof val === 'string' ? val : null;
  }
}
