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
    fixture.detectChanges();
  });

  it('should not show anything if control is valid', () => {
    const control = new FormControl('valid value', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorContainer =
      fixture.nativeElement.querySelector('.error-container');
    expect(errorContainer).toBeNull();
  });

  it('should not show anything if control is invalid but untouched', () => {
    const control = new FormControl('', Validators.required);

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorContainer =
      fixture.nativeElement.querySelector('.error-container');
    expect(errorContainer).toBeNull();
  });

  it('should show "required" error when control is empty and touched', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText.textContent).toContain('This field is required');
  });

  it('should show "minlength" error with dynamic character count', () => {
    const control = new FormControl('abc', Validators.minLength(6));
    control.markAsTouched();

    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText.textContent).toContain('Needs 3 more characters');
  });

  it('should show "passwordMismatch" error when groupContext is provided', () => {
    const passwordControl = new FormControl('123456');
    const confirmControl = new FormControl('123457');
    confirmControl.markAsTouched();

    const group = new FormGroup(
      {
        password: passwordControl,
        confirm: confirmControl,
      },
      { selectors: () => ({ passwordMismatch: true }) } as any,
    );
    spyOn(group, 'hasError').and.callFake(
      (errorName: string) => errorName === 'passwordMismatch',
    );

    fixture.componentRef.setInput('control', confirmControl);
    fixture.componentRef.setInput('groupContext', group);
    fixture.detectChanges();

    const errorTexts = fixture.nativeElement.querySelectorAll('.error-text');
    const hasMismatchError = Array.from(errorTexts).some((el: any) =>
      el.textContent.includes('Passwords do not match'),
    );

    expect(hasMismatchError).toBeTrue();
  });
});
