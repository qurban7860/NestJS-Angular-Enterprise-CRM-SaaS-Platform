import { Routes } from '@angular/router';

export const PREMIUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/premium-dashboard.component').then(c => c.PremiumDashboardComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/roles/roles.component').then(c => c.RolesComponent)
  },
  {
    path: 'workflows',
    loadComponent: () => import('./pages/workflows/workflows.component').then(c => c.WorkflowsComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./pages/reports/reports.component').then(c => c.ReportsComponent)
  },
  {
    path: 'team',
    loadComponent: () => import('./pages/team/team.component').then(c => c.TeamManagementComponent)
  },
  {
    path: 'broadcasting',
    loadComponent: () => import('./pages/broadcasting/broadcasting.component').then(c => c.BroadcastingComponent)
  }
];
