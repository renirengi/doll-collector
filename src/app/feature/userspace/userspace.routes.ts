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
          import('./pages/doll-catalog-page/doll-catalog.component').then(
            (m) => m.DollCatalogComponent,
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./pages/user-favorites-page/user-favorites-page').then(
            (m) => m.UserFavoritesPage,
          ),
      },
      {
        path: 'shelf',
        loadComponent: () =>
          import('./pages/user-shelf-page/user-shelf-page').then(
            (m) => m.UserShelfPage,
          ),
      },
      {
        path: 'shop',
        loadComponent: () =>
          import('./pages/user-shop-page/user-shop-page').then(
            (m) => m.UserShopPage,
          ),
      },
      {
        path: 'sold-doll',
        loadComponent: () =>
          import('./pages/user-sold-doll-page/user-sold-doll-page').then(
            (m) => m.UserSoldDollPage,
          ),
      },
      {
        path: 'collections/:id',
        loadComponent: () =>
          import('./pages/collection-details-page/collection-details.component').then(
            (m) => m.CollectionDetailsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '../404' },
];
