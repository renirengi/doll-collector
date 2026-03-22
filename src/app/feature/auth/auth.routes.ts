import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },

  {
    path: 'signin',
    loadComponent: () =>
      import('./pages/page-signin/signin-page.component').then(
        (m) => m.SignInPageComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/page-signup/signup-page.component').then(
        (m) => m.SignUpPageComponent,
      ),
  },
];
