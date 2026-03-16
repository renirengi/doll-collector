import { Routes } from '@angular/router';
import { DollCatalogComponent } from './feature/userspace/doll-catalog/doll-catalog.component';

export const routes: Routes = [
  { path: '', redirectTo: 'catalog', pathMatch: 'full' },

  {
    path: 'catalog',
    component: DollCatalogComponent
  },

  {
    path: 'catalog/:manufacturer',
    component: DollCatalogComponent

  },

  {
    path: 'catalog/:manufacturer/:brand',
    component: DollCatalogComponent
  },

  // {
  //   path: 'doll/:id',
  //   loadComponent: () => import('./features/userspace/doll-detail/doll-detail.component').then(m => m.DollDetailComponent)
  // },
];
