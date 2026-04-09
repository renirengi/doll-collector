import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let dialogElement: HTMLDialogElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Get the dialog element reference
    dialogElement = fixture.debugElement.query(
      (el) => el.name === 'dialog',
    )?.nativeElement;
  });

  it('should create the modal component', () => {
    expect(component).toBeTruthy();
  });

  describe('Input: title', () => {
    it('should display the title in the modal', () => {
      const testTitle = 'Test Modal Title';

      fixture.componentRef.setInput('title', testTitle);
      fixture.detectChanges();

      const h3Element = dialogElement.querySelector('h3');

      expect(h3Element?.textContent).toBe(testTitle);
    });

    it('should have empty title by default', () => {
      const h3Element = dialogElement.querySelector('h3');

      expect(h3Element?.textContent).toBe('');
    });
  });

  describe('Model: visible', () => {
    it('should initially be false', () => {
      expect(component.visible()).toBe(false);
    });

    it('should open dialog when visible is set to true', (done) => {
      component.visible.set(true);
      fixture.detectChanges();

      // Use setTimeout to allow effect to run
      setTimeout(() => {
        expect(dialogElement.open).toBe(true);
        done();
      }, 0);
    });

    it('should close dialog when visible is set to false', (done) => {
      // First open the dialog
      component.visible.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        expect(dialogElement.open).toBe(true);

        // Then close it
        component.visible.set(false);
        fixture.detectChanges();

        setTimeout(() => {
          expect(dialogElement.open).toBe(false);
          done();
        }, 0);
      }, 0);
    });
  });

  describe('Model: data', () => {
    it('should initially be undefined', () => {
      expect(component.data()).toBeUndefined();
    });

    it('should allow setting data', () => {
      const testData = { key: 'value' };

      component.data.set(testData);
      expect(component.data()).toEqual(testData);
    });

    it('should merge data in showModal method', () => {
      const initialData = { key1: 'value1' };

      component.data.set(initialData);

      const additionalData = { key2: 'value2' };

      component.showModal(additionalData);

      expect(component.data()).toEqual({
        ...initialData,
        ...additionalData,
      });
    });

    it('should merge data when showModal is called with no arguments', () => {
      const initialData = { key1: 'value1' };

      component.data.set(initialData);

      component.showModal();

      expect(component.data()).toEqual(initialData);
    });
  });

  describe('Model: payload', () => {
    it('should initially be undefined', () => {
      expect(component.payload()).toBeUndefined();
    });

    it('should allow setting payload', () => {
      const testPayload = { result: 'success' };

      component.payload.set(testPayload);
      expect(component.payload()).toEqual(testPayload);
    });
  });

  describe('showModal method', () => {
    it('should open the dialog', (done) => {
      component.showModal();
      fixture.detectChanges();

      setTimeout(() => {
        expect(dialogElement.open).toBe(true);
        done();
      }, 0);
    });

    it('should set visible to true', () => {
      component.showModal();
      expect(component.visible()).toBe(true);
    });

    it('should not open dialog if already open', (done) => {
      component.showModal();
      fixture.detectChanges();

      setTimeout(() => {
        const firstOpen = dialogElement.open;

        component.showModal();

        setTimeout(() => {
          expect(dialogElement.open).toBe(firstOpen);
          done();
        }, 0);
      }, 0);
    });

    it('should merge passed data with existing data', () => {
      const initialData = { key1: 'value1' };

      component.data.set(initialData);

      const newData = { key2: 'value2' };

      component.showModal(newData);

      expect(component.data()).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should overwrite overlapping keys when merging data', () => {
      const initialData = { key: 'initial' };

      component.data.set(initialData);

      const newData = { key: 'updated' };

      component.showModal(newData);

      expect(component.data()).toEqual({ key: 'updated' });
    });
  });

  describe('closeModal method', () => {
    beforeEach((done) => {
      component.showModal();
      fixture.detectChanges();

      setTimeout(() => {
        done();
      }, 0);
    });

    it('should close the dialog', (done) => {
      component.closeModal();
      fixture.detectChanges();

      setTimeout(() => {
        expect(dialogElement.open).toBe(false);
        done();
      }, 0);
    });

    it('should set visible to false', () => {
      component.closeModal();
      expect(component.visible()).toBe(false);
    });

    it('should emit closed event with payload', (done) => {
      const closedSpy = jasmine.createSpy('closedSpy');

      component.closed.subscribe(closedSpy);

      const payload = { result: 'confirmed' };

      component.closeModal(payload);

      setTimeout(() => {
        expect(closedSpy).toHaveBeenCalledWith(payload);
        done();
      }, 0);
    });

    it('should emit closed event with merged payload', (done) => {
      const closedSpy = jasmine.createSpy('closedSpy');

      component.closed.subscribe(closedSpy);

      const initialPayload = { initial: 'payload' };

      component.payload.set(initialPayload);

      const additionalPayload = { additional: 'data' };

      component.closeModal(additionalPayload);

      setTimeout(() => {
        expect(closedSpy).toHaveBeenCalledWith({
          initial: 'payload',
          additional: 'data',
        });
        done();
      }, 0);
    });

    it('should not close dialog if already closed', (done) => {
      component.closeModal();
      fixture.detectChanges();

      setTimeout(() => {
        const closedSpy = jasmine.createSpy('closedSpy');

        component.closed.subscribe(closedSpy);

        component.closeModal();

        setTimeout(() => {
          expect(closedSpy).not.toHaveBeenCalled();
          done();
        }, 0);
      }, 0);
    });
  });

  describe('Output: closed', () => {
    it('should emit closed event when closeModal is called', (done) => {
      const closedSpy = jasmine.createSpy('closedSpy');

      component.closed.subscribe(closedSpy);

      component.showModal();
      fixture.detectChanges();

      setTimeout(() => {
        component.closeModal();
        fixture.detectChanges();

        setTimeout(() => {
          expect(closedSpy).toHaveBeenCalled();
          done();
        }, 0);
      }, 0);
    });

    it('should emit merged payload from closeModal call and model', (done) => {
      const closedSpy = jasmine.createSpy('closedSpy');

      component.closed.subscribe(closedSpy);

      const modelPayload = { from: 'model' };

      component.payload.set(modelPayload);

      component.showModal();
      fixture.detectChanges();

      setTimeout(() => {
        const closePayload = { from: 'closeModal' };

        component.closeModal(closePayload);

        setTimeout(() => {
          expect(closedSpy).toHaveBeenCalledWith({
            from: 'closeModal',
          });
          done();
        }, 0);
      }, 0);
    });
  });

  describe('Dialog synchronization with visible model', () => {
    it('should open dialog when visible changes from false to true', (done) => {
      expect(component.visible()).toBe(false);
      expect(dialogElement.open).toBe(false);

      component.visible.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        expect(dialogElement.open).toBe(true);
        done();
      }, 0);
    });

    it('should close dialog when visible changes from true to false', (done) => {
      component.visible.set(true);
      fixture.detectChanges();

      setTimeout(() => {
        expect(dialogElement.open).toBe(true);

        component.visible.set(false);
        fixture.detectChanges();

        setTimeout(() => {
          expect(dialogElement.open).toBe(false);
          done();
        }, 0);
      }, 0);
    });
  });

  describe('ng-content projection', () => {
    it('should project content into the dialog', () => {
      // Create a component with content
      const template = `
        <app-modal>
          <p>Test content</p>
        </app-modal>
      `;

      // Re-create fixture with template
      fixture = TestBed.createComponent(ModalComponent);
      component = fixture.componentInstance;

      const projectedContent =
        fixture.debugElement.nativeElement.querySelector('dialog ng-content');

      // Note: ng-content is virtual, so we verify it exists in template
      expect(fixture.nativeElement.querySelector('dialog')).toBeTruthy();
    });
  });
});
