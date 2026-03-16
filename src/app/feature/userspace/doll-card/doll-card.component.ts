import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Doll } from '../../../shared/models/doll.model';

@Component({
  selector: 'app-doll-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './doll-card.component.html',
  styleUrls: ['./doll-card.component.scss'],
})
export class DollCardComponent {
  @Input({ required: true }) doll!: Doll;

  onCardClick() {
    console.log('Клик по кукле:', this.doll.name);
  }
}
