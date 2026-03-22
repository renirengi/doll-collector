import { Routes } from '@angular/router';
import { DollCatalogComponent } from './feature/userspace/pages/doll-catalog/doll-catalog.component';

export const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./feature/auth/auth.routes').then((m) => m.authRoutes),
  },
  // {
  //   path: 'admin-panel',
  //   loadChildren: () => import('./features/admin-panel/admin-panel.routes').then((m) => m.adminPanelRoutes),
  //   canActivate: [RoleGuard],
  //   data: { roles: [UserRoles.Admin, UserRoles.Support] },
  // },
  {
    path: 'user',
    loadChildren: () =>
      import('./feature/userspace/userspace.routes').then(
        (m) => m.userspaceRoutes,
      ),
    // canActivate: [RoleGuard],
    // resolve: { userInfo, questions },
    // data: { roles: [UserRoles.Client, UserRoles.Support, UserRoles.Admin] },
  },
  { path: '**', redirectTo: '404', pathMatch: 'full' },
  // { path: '404', component: NotFoundComponent },
];
