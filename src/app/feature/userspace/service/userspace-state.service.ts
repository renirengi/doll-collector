import { Injectable, signal, WritableSignal, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserspaceStateService {
  private readonly _isFilterOpen: WritableSignal<boolean> =
    signal<boolean>(false);

  /** Exposed as readonly to prevent direct mutations from components */
  public readonly isFilterOpen: Signal<boolean> =
    this._isFilterOpen.asReadonly();
  public readonly totalDolls: WritableSignal<number> = signal<number>(0);

  /**
   * Toggles the visibility of the filter panel.
   * Complexity: 1
   */
  public toggleFilters(): void {
    this._isFilterOpen.update((state: boolean): boolean => !state);
  }

  /**
   * Explicitly closes the filter panel.
   * Complexity: 1
   */
  public closeFilters(): void {
    this._isFilterOpen.set(false);
  }
}
