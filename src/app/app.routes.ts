import { Routes } from '@angular/router';
import { DollCatalogComponent } from './feature/userspace/pages/doll-catalog-page/doll-catalog.component';
import { RoleGuard } from './core/guards/role.guard';
import { UserRoles } from './shared/models';

export const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./feature/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'admin-panel',
    loadChildren: () =>
      import('./feature/admin-panel/admin-panel.routes').then(
        (m) => m.adminPanelRoutes,
      ),
    canActivate: [RoleGuard],
    data: { roles: [UserRoles.Admin] },
  },
  {
    path: 'user',
    canActivate: [RoleGuard],
    loadChildren: () =>
      import('./feature/userspace/userspace.routes').then(
        (m) => m.userspaceRoutes,
      ),
    data: { roles: [UserRoles.Client, UserRoles.Admin] },
  },
  { path: '**', redirectTo: '404', pathMatch: 'full' },
  // { path: '404', component: NotFoundComponent },
];
