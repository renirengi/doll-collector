import { Component } from '@angular/core';
import { ManufacturerNavigationComponent } from '../manufacturer-navigation/manufacturer-navigation.component';

@Component({
  selector: 'app-sidebar',
  imports: [],
  template: `<div
    class="w-[150px] flex flex-col justify-start align-middle"
  ></div>`,
  styleUrl: './sidebar.component.scss',
})
export class Sidebar {}
