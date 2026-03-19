import { Component } from '@angular/core';
import { ManufacturerNavigationComponent } from '../manufacturer-navigation/manufacturer-navigation.component';
import { DollFiltersComponent } from '../doll-filters/doll-filters.component';

@Component({
  selector: 'app-filter-panel',
  imports: [ManufacturerNavigationComponent, DollFiltersComponent],
  template: `<div
    class="flex flex-col border-t bg-white shadow-sm border-b border-slate-200"
  >
    <app-manufacturer-navigation></app-manufacturer-navigation>
    <div class="px-4 pb-4">
      <app-doll-filters></app-doll-filters>
    </div>
  </div>`,
  styleUrl: './filter-panel.component.scss',
})
export class FilterPanelComponent {}
