import { Component, inject } from '@angular/core';
import { UserspaceStateService } from '../../service/userspace-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: 'header.component.scss',
})
export class Header {
  protected ui = inject(UserspaceStateService);
}
