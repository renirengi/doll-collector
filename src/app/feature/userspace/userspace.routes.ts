import { Routes } from '@angular/router';
import { UserPageComponent } from './user-page.component';

export const userspaceRoutes: Routes = [
  {
    path: '',
    component: UserPageComponent,
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./pages/doll-catalog/doll-catalog.component').then(
            (m) => m.DollCatalogComponent,
          ),
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'catalog/:manufacturer',
        loadComponent: () =>
          import('./pages/doll-catalog/doll-catalog.component').then(
            (m) => m.DollCatalogComponent,
          ),
      },
      {
        path: 'catalog/:manufacturer/:brand',
        loadComponent: () =>
          import('./pages/doll-catalog/doll-catalog.component').then(
            (m) => m.DollCatalogComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '../404' },
];
