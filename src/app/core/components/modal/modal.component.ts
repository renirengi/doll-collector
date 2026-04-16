import {
  Component,
  input,
  output,
  viewChild,
  effect,
  ElementRef,
  model,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  template: `
    <dialog #dialogRef>
      <div class="modal-header">
        <span class="user-modal-span"></span>
        <h3>{{ title() }}</h3>

        <button class="close-button" (click)="closeModal()" title="Close modal">
          🗙
        </button>
      </div>
      <section class="modal-content">
        <ng-content></ng-content>
      </section>
    </dialog>
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  /* Title of the modal */
  title = input<string>('');

  /* Additional options for the children components */
  data = model<object | undefined>(undefined);

  /* Payload for the children components */
  payload = model<object | undefined>(undefined);

  /* Controls modal visibility */
  visible = model<boolean>(false);

  /* Emits when modal is closed */
  closed = output<object | undefined>();

  /* Reference to the dialog element */
  private dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');
  /* Dialog element */
  private dialog = computed(() => this.dialogRef()!.nativeElement);

  constructor() {
    effect(() => {
      if (!this.dialog().open && this.visible()) this.showModal();

      if (this.dialog().open && !this.visible()) this.closeModal();
    });
  }

  /* Shows the modal with optional data */
  showModal(data?: object): void {
    if (!this.dialog().open) {
      this.data.set({ ...(this.data() ?? {}), ...(data ?? {}) });
      this.dialog().showModal();
      this.visible.set(true);
    }
  }

  /* Closes the modal and emits the closed event
   * payload: Optional object to emit with the closed event, only for children components to use
   */
  closeModal(payload?: object): void {
    if (this.dialog().open) {
      this.dialog().close();
      this.closed.emit({ ...(this.payload() ?? {}), ...(payload ?? {}) });
      this.visible.set(false);
    }
  }
}
