import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormErrorComponent } from './form-error.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

describe('FormErrorComponent', () => {
  let component: FormErrorComponent;
  let fixture: ComponentFixture<FormErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorComponent);
    component = fixture.componentInstance;
  });

  it('should not show anything if control is valid and no group errors', () => {
    const control = new FormControl('valid value', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.error-container');
    expect(container).toBeNull();
  });

  it('should not show anything if control is invalid but untouched', () => {
    const control = new FormControl('', Validators.required);

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector('.error-container');
    expect(container).toBeNull();
  });

  it('should show required error when control is empty and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText.textContent).toContain('This field is required');
  });

  it('should show minlength error with remaining characters count', () => {
    const control = new FormControl('abc', Validators.minLength(6));
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText.textContent).toContain('Needs 3 more characters');
  });

  it('should show passwordMismatch error from groupContext', () => {
    const control = new FormControl('password123');
    control.markAsTouched();

    const group = new FormGroup({});
    // Mocking hasError for group context
    spyOn(group, 'hasError').and.callFake(
      (name: string) => name === 'passwordMismatch',
    );

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('groupContext', group);
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText.textContent).toContain('Passwords do not match');
  });

  it('should show both control error and group error if both exist', () => {
    const control = new FormControl('abc', Validators.minLength(6));
    control.markAsTouched();

    const group = new FormGroup({});
    spyOn(group, 'hasError').and.callFake(
      (name: string) => name === 'passwordMismatch',
    );

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('groupContext', group);
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.error-text');
    expect(errors.length).toBe(2);
    expect(errors[0].textContent).toContain('Too short');
    expect(errors[1].textContent).toContain('Passwords do not match');
  });
});
