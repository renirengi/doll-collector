import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessageService } from './message-service.service';

describe('MessageService', () => {
  let service: MessageService;
  const containerId = 'custom-snackbar-container';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService],
    });
    service = TestBed.inject(MessageService);

    const container = document.getElementById(containerId);

    if (container) container.remove();

    document.querySelectorAll('dialog').forEach((d) => d.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call showMessage when showSuccess is called', () => {
    const spy = spyOn<any>(service, 'showMessage');

    service.showSuccess('Success message');
    expect(spy).toHaveBeenCalledWith(
      'Success message',
      'custom-snackbar-success',
    );
  });

  it('should call showMessage when showError is called', () => {
    const spy = spyOn<any>(service, 'showMessage');

    service.showError('Error message');
    expect(spy).toHaveBeenCalledWith('Error message', 'custom-snackbar-error');
  });

  it('should reuse existing container in body', () => {
    const first = (service as any).createContainer();
    const second = (service as any).createContainer();

    expect(first).toBe(second);
    expect(first.parentElement).toBe(document.body);
  });

  it('should move container to dialog when modal is open', () => {
    (service as any).createContainer();

    const dialog = document.createElement('dialog');

    dialog.open = true;
    document.body.appendChild(dialog);

    const container = (service as any).createContainer();

    expect(container.parentElement).toBe(dialog);
    expect(document.querySelectorAll(`#${containerId}`).length).toBe(1);

    dialog.remove();
  });

  it('should move container back to body when dialog is closed', () => {
    const dialog = document.createElement('dialog');

    dialog.open = true;
    document.body.appendChild(dialog);
    (service as any).createContainer();

    dialog.open = false;

    const container = (service as any).createContainer();

    expect(container.parentElement).toBe(document.body);

    dialog.remove();
  });

  it('should remove container and elements after duration', fakeAsync(() => {
    service.showSuccess('Test message');
    const container = document.getElementById(containerId);
    const snackbar = container?.firstChild as HTMLElement;

    tick(3000);
    snackbar.dispatchEvent(new Event('transitionend'));

    expect(document.getElementById(containerId)).toBeNull();
  }));
});
