import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCollectionFormComponent } from './create-collection-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CollectionService } from '../../../../core/services/collection.service';
import { COLLECTION_ICONS } from '../../../../shared/constants';
import { MessageService } from '../../../../core/services/message-service.service';
import { FormErrorComponent } from '../form-error/form-error.component';

class CollectionServiceMock {
  createCollection() {
    return Promise.resolve({} as any);
  }
}

class MessageServiceMock {
  showSuccess(message: string) {}
  showError(message: string) {}
}

describe('CreateCollectionFormComponent', () => {
  let component: CreateCollectionFormComponent;
  let fixture: ComponentFixture<CreateCollectionFormComponent>;
  let collectionService: CollectionService;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Добавляем FormErrorComponent в импорты, так как это standalone компонент
      imports: [
        CreateCollectionFormComponent,
        ReactiveFormsModule,
        FormErrorComponent,
      ],
      providers: [
        { provide: CollectionService, useClass: CollectionServiceMock },
        { provide: MessageService, useClass: MessageServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCollectionFormComponent);
    component = fixture.componentInstance;
    collectionService = TestBed.inject(CollectionService);
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  });

  it('should initialize with default values', () => {
    expect(component.form.value.icon).toBe('icon-crown');
    expect(component.form.invalid).toBeTrue();
  });

  it('should validate name length', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('Short');
    expect(nameControl?.valid).toBeFalse();

    nameControl?.setValue('Valid Collection Name');
    expect(nameControl?.valid).toBeTrue();
  });

  it('should change icon on click', () => {
    const targetIcon = COLLECTION_ICONS[0].iconClass;
    component.form.patchValue({ icon: targetIcon });
    expect(component.form.value.icon).toBe(targetIcon);
  });

  it('should call messageService.showSuccess on successful submit', async () => {
    const createSpy = spyOn(
      collectionService,
      'createCollection',
    ).and.returnValue(Promise.resolve({} as any));
    const successSpy = spyOn(messageService, 'showSuccess');
    spyOn(component.success, 'emit');

    component.form.patchValue({
      name: 'New Collection Name',
      description: 'Detailed description more than 8 chars',
      icon: 'icon-heart',
    });

    await component.submit();

    expect(createSpy).toHaveBeenCalled();
    expect(successSpy).toHaveBeenCalledWith('Collection created successfully!');
    expect(component.success.emit).toHaveBeenCalled();
    expect(component.form.value.icon).toBe('icon-crown');
  });

  it('should call messageService.showError on submit failure', async () => {
    const createSpy = spyOn(
      collectionService,
      'createCollection',
    ).and.returnValue(Promise.reject('Error'));
    const errorSpy = spyOn(messageService, 'showError');

    component.form.patchValue({
      name: 'New Collection Name',
      description: 'Detailed description more than 8 chars',
      icon: 'icon-heart',
    });

    await component.submit();

    expect(createSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to create collection. Please try again.',
    );
    expect(component.isLoading()).toBeFalse();
  });

  it('should disable button when form is invalid or loading', () => {
    const btn = fixture.nativeElement.querySelector('button[type="submit"]');

    component.form.patchValue({ name: '' });
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.form.patchValue({
      name: 'Valid Collection Name',
      description: 'Valid Description (long enough)',
    });
    component.isLoading.set(true);
    fixture.detectChanges();
    expect(btn.disabled).toBeTrue();

    component.isLoading.set(false);
    fixture.detectChanges();
    expect(btn.disabled).toBeFalse();
  });

  it('should render form error component for invalid fields', () => {
    const nameControl = component.form.get('name');
    nameControl?.markAsTouched();
    nameControl?.setValue('');
    fixture.detectChanges();

    const errorElement = fixture.nativeElement.querySelector('app-form-error');
    expect(errorElement).toBeTruthy();
  });
});
