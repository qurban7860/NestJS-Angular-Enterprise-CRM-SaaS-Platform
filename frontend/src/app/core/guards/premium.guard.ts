import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SubscriptionService } from '../services/subscription.service';
import { map, tap } from 'rxjs';

export const premiumGuard: CanActivateFn = (route, state) => {
  const subscriptionService = inject(SubscriptionService);
  const router = inject(Router);

  return subscriptionService.isPremium$.pipe(
    tap(isPremium => {
      if (!isPremium) {
        router.navigate(['/billing/upgrade'], { queryParams: { returnUrl: state.url } });
      }
    })
  );
};
