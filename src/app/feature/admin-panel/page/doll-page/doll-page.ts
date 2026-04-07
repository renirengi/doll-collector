import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Doll } from '../../../../shared/models';
import { AdminDollService } from '../../services/admin-doll.service';

interface ColumnConfig {
  key: keyof Doll | 'actions';
  label: string;
  isNumeric?: boolean;
}

@Component({
  selector: 'app-doll-page',
  standalone: true,
  imports: [CommonModule, MatPaginatorModule],
  templateUrl: './doll-page.html',
  styleUrl: '../../../../../styles/admin-pages.scss',
})
export class DollPage implements OnInit {
  protected readonly adminService = inject(AdminDollService);

  protected readonly columnConfig: ColumnConfig[] = [
    { key: 'itemNumber', label: 'SKU' },
    { key: 'originalName', label: 'Full Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'series', label: 'Series' },
    { key: 'releaseYear', label: 'Year', isNumeric: true },
    { key: 'actions', label: '' },
  ];

  ngOnInit(): void {
    this.adminService.loadPage(1);
  }

  protected handlePageEvent(e: PageEvent): void {
    this.adminService.loadPage(e.pageIndex + 1, e.pageSize);
  }

  protected edit(id: string): void {
    console.log('Edit doll:', id);
  }

  protected onDelete(id: string): void {
    if (confirm('Are you sure?')) {
      this.adminService.deleteDoll(id);
    }
  }

  protected getCellValue(doll: any, key: string): string {
    return doll[key] ?? '—';
  }
}
