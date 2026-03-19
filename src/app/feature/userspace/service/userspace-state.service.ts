import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserspaceStateService {
  private _isFilterOpen = signal<boolean>(false);
  public isFilterOpen = this._isFilterOpen.asReadonly();

  public totalDolls = signal<number>(0);

  toggleFilters() {
    this._isFilterOpen.update((state) => !state);
  }

  closeFilters() {
    this._isFilterOpen.set(false);
  }
}
