import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService, SubscriptionStatus } from '../../../core/services/billing.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16">
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Choose Your <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Growth Plan</span>
          </h1>
          <p class="mt-4 text-xl text-brand-secondary max-w-2xl mx-auto">
            Scale your organization with our premium features and unlimited potential.
          </p>
        </div>

        <!-- Current Plan Banner -->
        <div *ngIf="subscription" class="mb-8 glass-panel p-4 rounded-xl border border-brand-primary/30 max-w-3xl mx-auto">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="text-sm text-brand-secondary">Current Plan:</div>
              <span class="text-lg font-bold text-brand-primary">{{ subscription.plan }}</span>
              <span *ngIf="subscription.status" class="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">{{ subscription.status }}</span>
            </div>
            <button (click)="syncStatus()" class="text-sm text-brand-secondary hover:text-white transition-colors">
              Refresh Status
            </button>
          </div>
          <div *ngIf="subscription.currentPeriodEnd" class="text-sm text-brand-secondary mt-1">
            Next billing: {{ subscription.currentPeriodEnd | date:'mediumDate' }}
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <!-- Free Plan -->
          <div class="glass-panel p-8 flex flex-col border-white/5 hover:border-brand-primary/20 transition-all duration-300">
            <h3 class="text-2xl font-bold">Free</h3>
            <p class="text-brand-secondary mt-2 text-sm">Perfect for individuals and side projects.</p>
            <div class="mt-6 flex items-baseline">
              <span class="text-4xl font-extrabold">$0</span>
              <span class="ml-1 text-xl text-brand-secondary">/month</span>
            </div>
            <ul class="mt-8 space-y-4 flex-1">
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Up to 5 team members
              </li>
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Basic CRM features
              </li>
              <li class="flex items-center gap-3 text-sm opacity-40">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Advanced Analytics
              </li>
            </ul>
            <button disabled class="mt-8 w-full py-3 px-4 rounded-xl border border-brand-border text-brand-secondary font-bold text-sm">Current Plan</button>
          </div>

          <!-- Pro Plan -->
          <div class="glass-panel p-8 flex flex-col border-brand-primary/30 relative transform scale-105 shadow-2xl bg-gradient-to-b from-white/[0.05] to-transparent">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</div>
            <h3 class="text-2xl font-bold">Pro</h3>
            <p class="text-brand-secondary mt-2 text-sm">For growing teams that need more power.</p>
            <div class="mt-6 flex items-baseline">
              <span class="text-4xl font-extrabold">$29</span>
              <span class="ml-1 text-xl text-brand-secondary">/month</span>
            </div>
            <ul class="mt-8 space-y-4 flex-1">
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Unlimited members
              </li>
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Advanced CRM & Deals
              </li>
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Task Automation
              </li>
            </ul>
            <button (click)="upgrade('PRO')" class="premium-button mt-8 w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20">Upgrade Now</button>
          </div>

          <!-- Enterprise Plan -->
          <div class="glass-panel p-8 flex flex-col border-white/5 hover:border-indigo-500/30 transition-all duration-300">
            <h3 class="text-2xl font-bold">Enterprise</h3>
            <p class="text-brand-secondary mt-2 text-sm">Custom solutions for large organizations.</p>
            <div class="mt-6 flex items-baseline">
              <span class="text-4xl font-extrabold">$99</span>
              <span class="ml-1 text-xl text-brand-secondary">/month</span>
            </div>
            <ul class="mt-8 space-y-4 flex-1">
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Everything in Pro
              </li>
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                SSO & Custom Auth
              </li>
              <li class="flex items-center gap-3 text-sm">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                24/7 Priority Support
              </li>
            </ul>
            <button (click)="upgrade('ENTERPRISE')" class="mt-8 w-full py-3 px-4 rounded-xl border border-indigo-500/30 text-indigo-400 font-bold text-sm hover:bg-indigo-500/10 transition-colors">Contact Sales</button>
          </div>
        </div>

        <div class="mt-16 text-center text-brand-secondary text-sm">
          <p>Secure payments powered by <strong>Stripe</strong>. No credit card required to start.</p>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent implements OnInit {
  private billing = inject(BillingService);
  subscription: SubscriptionStatus | null = null;

  ngOnInit() {
    this.loadSubscriptionStatus();
  }

  loadSubscriptionStatus() {
    this.billing.getSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscription = status;
      },
      error: (err) => {
        console.error('Failed to load subscription:', err);
      }
    });
  }

  syncStatus() {
    this.billing.syncSubscriptionStatus().subscribe({
      next: (status) => {
        this.subscription = status;
        console.log('Subscription synced:', status);
      },
      error: (err) => {
        console.error('Failed to sync subscription:', err);
      }
    });
  }

  upgrade(plan: 'PRO' | 'ENTERPRISE') {
    this.billing.createCheckoutSession(plan).subscribe({
      next: (url) => {
        window.location.href = url;
      },
      error: (err) => {
        console.error('Failed to initiate checkout:', err);
      }
    });
  }
}
