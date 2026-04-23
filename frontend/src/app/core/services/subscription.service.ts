import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, of, tap, BehaviorSubject, catchError } from 'rxjs';
import { BillingService, SubscriptionStatus } from './billing.service';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.reducer';
import { PLAN_LIMITS, PlanLimits } from '../configs/plan-limits.config';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private billingService = inject(BillingService);
  private store = inject(Store);
  private subscriptionSubject = new BehaviorSubject<SubscriptionStatus | null>(null);
  
  subscription$ = this.subscriptionSubject.asObservable();
  
  limits$: Observable<PlanLimits> = this.subscription$.pipe(
    map(status => {
      const plan = status?.plan || 'FREE';
      return PLAN_LIMITS[plan];
    })
  );

  constructor() {
    // Initial load from storage to prevent flicker
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser);
        if (user.plan) {
          this.subscriptionSubject.next({ plan: user.plan, status: 'active', currentPeriodEnd: null } as any);
        }
      } catch (e) {
        console.error('Failed to parse cached user for subscription', e);
      }
    }

    // Refresh status whenever user profile changes (login/app start)
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        // Optimistically set plan from user object to avoid UI flicker
        if (user.plan && (!this.subscriptionSubject.value || this.subscriptionSubject.value.plan !== user.plan)) {
           this.subscriptionSubject.next({ plan: user.plan, status: 'active', currentPeriodEnd: null } as any);
        }
        this.refreshStatus().subscribe();
      } else {
        this.subscriptionSubject.next(null);
      }
    });
  }

  refreshStatus(): Observable<SubscriptionStatus> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return of({ plan: 'FREE', status: null, currentPeriodEnd: null } as SubscriptionStatus).pipe(
        tap(status => this.subscriptionSubject.next(status))
      );
    }

    return this.billingService.getSubscriptionStatus().pipe(
      tap(status => {
        this.subscriptionSubject.next(status);
      }),
      catchError(err => {
        // Handle 401 silently if user is not fully logged in yet
        return of({ plan: 'FREE', status: null, currentPeriodEnd: null } as SubscriptionStatus);
      })
    );
  }

  hasPlan(requiredPlan: 'FREE' | 'PREMIUM' | 'ENTERPRISE'): Observable<boolean> {
    return this.subscription$.pipe(
      map(status => {
        if (!status) return false;
        const tiers = { 'FREE': 0, 'PREMIUM': 1, 'ENTERPRISE': 2 };
        const currentTier = tiers[status.plan] ?? 0;
        const requiredTier = tiers[requiredPlan];
        return currentTier >= requiredTier;
      })
    );
  }

  get isPremium$(): Observable<boolean> {
    return this.hasPlan('PREMIUM');
  }
}
