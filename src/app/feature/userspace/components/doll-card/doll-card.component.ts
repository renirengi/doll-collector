import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  Doll,
  UserDoll,
  EnrichedUserDoll,
  DollDataType,
} from '../../../../shared/models';

@Component({
  selector: 'app-doll-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './doll-card.component.html',
  styleUrls: ['./doll-card.component.scss'],
})
export class DollCardComponent {
  @Input({ required: true }) doll!: DollDataType;

  /**
   * Narrow down the type to EnrichedUserDoll.
   */
  public isUserDoll(data: DollDataType): data is EnrichedUserDoll {
    return (data as EnrichedUserDoll).dollId !== undefined;
  }

  /**
   * Returns the master catalog data source.
   */
  public get d(): Doll {
    return this.isUserDoll(this.doll) ? this.doll.catalogInfo : this.doll;
  }

  onCardClick(): void {
    console.log('Клик по кукле:', this.d.originalName);
  }
}
