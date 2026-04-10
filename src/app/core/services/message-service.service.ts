import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private containerId = 'custom-snackbar-container';

  private createContainer(): HTMLElement {
    const activeModal = document.querySelector('dialog[open]');
    const targetParent = activeModal || document.body;
    let container = document.getElementById(this.containerId);

    if (!container || container.parentElement !== targetParent) {
      if (container) {
        container.remove();
      }

      container = document.createElement('div');
      container.id = this.containerId;
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.left = '50%';
      container.style.transform = 'translateX(-50%)';
      container.style.zIndex = '15000';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '10px';
      container.style.pointerEvents = 'none';
      targetParent.appendChild(container);
    }

    return container;
  }

  private showMessage(
    message: string,
    cssClass: string,
    duration = 3000,
  ): void {
    const container = this.createContainer();
    const snackbar = document.createElement('div');

    snackbar.textContent = message;
    snackbar.className = cssClass;
    snackbar.style.pointerEvents = 'auto';
    snackbar.style.padding = '12px 24px';
    snackbar.style.borderRadius = '12px';
    snackbar.style.minWidth = '200px';
    snackbar.style.fontSize = '20px';
    snackbar.style.fontWeight = '500';
    snackbar.style.textAlign = 'center';
    snackbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    snackbar.style.opacity = '0';
    snackbar.style.transition = 'opacity 0.3s ease-in-out';
    snackbar.style.backgroundColor = 'white';
    container.appendChild(snackbar);
    requestAnimationFrame(() => {
      snackbar.style.opacity = '1';
    });

    setTimeout(() => {
      snackbar.style.opacity = '0';
      snackbar.addEventListener('transitionend', () => {
        snackbar.remove();

        if (container.childElementCount === 0) {
          container.remove();
        }
      });
    }, duration);
  }

  showSuccess(message: string): void {
    this.showMessage(message, 'custom-snackbar-success');
  }

  showError(message: string): void {
    this.showMessage(message, 'custom-snackbar-error');
  }
}
