import { Component, inject } from '@angular/core';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: 'header.component.scss',
})
export class Header {
  protected ui = inject(UserspaceStateService);
}
