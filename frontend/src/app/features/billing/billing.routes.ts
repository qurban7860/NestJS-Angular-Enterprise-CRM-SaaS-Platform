import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: 'pricing',
    loadComponent: () => import('./pricing/pricing.component').then(m => m.PricingComponent)
  },
  {
    path: 'success',
    loadComponent: () => import('./success/success.component').then(m => m.BillingSuccessComponent)
  },
  {
    path: 'cancel',
    loadComponent: () => import('./cancel/cancel.component').then(m => m.BillingCancelComponent)
  }
];
