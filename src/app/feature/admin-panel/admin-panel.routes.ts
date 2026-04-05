import { inject } from '@angular/core';
import { ResolveFn, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel.component';

export const adminPanelRoutes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,
    children: [
      { path: '', redirectTo: 'eventlog', pathMatch: 'full' },
      {
        path: 'eventlog',
        loadComponent: () =>
          import('./page/event-log-page/event-log-page').then(
            (m) => m.EventLogPage,
          ),
        runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./page/support-page/support-page').then((m) => m.SupportPage),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./components/ticket-details/ticket-details.component').then(
                (m) => m.TicketDetailsComponent,
              ),
          },
        ],
      },
      {
        path: 'dolls',
        loadComponent: () =>
          import('./page/doll-page/doll-page').then((m) => m.DollPage),
      },
      {
        path: 'doll/new',
        loadComponent: () =>
          import('./page/doll-edit-page/doll-edit-page').then(
            (m) => m.DollEditPage,
          ),
      },
      {
        path: 'user-accounts',
        loadComponent: () =>
          import('./page/user-account-page/user-account-page').then(
            (m) => m.UserAccountPage,
          ),
        children: [
          {
            path: ':id',
            loadComponent: () =>
              import('./components/edit-user/edit-user.component').then(
                (m) => m.EditUserComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
