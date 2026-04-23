import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'crm',
        loadChildren: () => import('./features/crm/crm.routes').then(r => r.CRM_ROUTES)
      },
      {
        path: 'tasks',
        loadChildren: () => import('./features/tasks/tasks.routes').then(r => r.TASK_ROUTES)
      },
      {
        path: 'system',
        loadChildren: () => import('./features/system/system.routes').then(r => r.systemRoutes)
      },
      {
        path: 'billing',
        loadChildren: () => import('./features/billing/billing.routes').then(r => r.BILLING_ROUTES)
      },
      {
        path: 'premium',
        loadComponent: () => import('./features/premium/pages/premium-dashboard.component').then(c => c.PremiumDashboardComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  }
];
