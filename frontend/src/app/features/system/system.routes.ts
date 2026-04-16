import { Routes } from '@angular/router';

export const systemRoutes: Routes = [
  {
    path: '',
    redirectTo: 'audit-logs',
    pathMatch: 'full',
  },
  {
    path: 'audit-logs',
    loadComponent: () =>
      import('./audit-logs/audit-logs.component').then(
        (m) => m.AuditLogsComponent
      ),
  },
];
