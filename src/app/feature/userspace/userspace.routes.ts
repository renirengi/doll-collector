import { Routes } from '@angular/router';
import { UserPageComponent } from './user-page.component';

export const userspaceRoutes: Routes = [
  {
    path: '',
    component: UserPageComponent,
    children: [
      { path: '', redirectTo: 'catalog', pathMatch: 'full' },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./pages/doll-catalog/doll-catalog.component').then(
            (m) => m.DollCatalogComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '../404' },
];
