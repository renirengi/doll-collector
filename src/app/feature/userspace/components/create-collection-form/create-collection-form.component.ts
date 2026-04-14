import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionService } from '../../../../core/services/collection.service';
import { COLLECTION_ICONS } from '../../../../shared/constants';
import { CreateCollectionDto } from '../../../../shared/models';
import { MessageService } from '../../../../core/services/message-service.service';

@Component({
  selector: 'app-create-collection-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="collection-form">
      <div class="form-field">
        <label class="field-label">Collection Name</label>
        <input
          id="name"
          formControlName="name"
          placeholder="My Awesome Collection"
        />
      </div>

      <div class="form-field">
        <label class="field-label">Description</label>
        <textarea
          id="description"
          formControlName="description"
          placeholder="What is this collection about?"
        ></textarea>
      </div>

      <div class="icon-selection-wrapper">
        <label class="field-label">Select Icon</label>
        <div class="icons-grid dark-icons-theme">
          @for (icon of availableIcons; track icon.id) {
            <button
              type="button"
              class="icon-toggle small"
              [class.active]="form.value.icon === icon.iconClass"
              (click)="form.patchValue({ icon: icon.iconClass })"
              [title]="icon.label"
            >
              <span [class]="'icon ' + icon.iconClass"></span>
            </button>
          }
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="submit-btn"
          [disabled]="form.invalid || isLoading()"
        >
          {{ isLoading() ? 'Creating...' : 'Create Collection' }}
        </button>
      </div>
    </form>
  `,
  styleUrls: ['./create-collection-form.component.scss'],
})
export class CreateCollectionFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly collectionService = inject(CollectionService);
  private readonly messageService = inject(MessageService);

  public readonly isLoading = signal(false);
  public readonly success = output<void>();

  public readonly availableIcons = COLLECTION_ICONS;

  public readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    icon: ['icon-crown', [Validators.required]],
  });

  public async submit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const rawValue = this.form.getRawValue();
    const iconName = rawValue.icon!.replace('icon-', '');
    const iconFileName = iconName.replace('-', '_') + '.svg';

    const baseUrl = window.location.origin;
    const fullIconUrl = `${baseUrl}/assets/icons/${iconFileName}`;

    const dto: CreateCollectionDto = {
      name: rawValue.name!,
      description: rawValue.description || '',
      icon: fullIconUrl,
    };

    try {
      await this.collectionService.createCollection(dto);
      this.messageService.showSuccess('Collection created successfully!');
      this.success.emit();
      this.form.reset({ icon: 'icon-crown' });
    } catch (error) {
      this.messageService.showError(
        'Failed to create collection. Please try again.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
