import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-billing-cancel',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="glass-panel max-w-md w-full p-8 text-center animate-in zoom-in duration-500">
        <div class="w-20 h-20 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </div>
        <h2 class="text-3xl font-bold mb-2">Payment Cancelled</h2>
        <p class="text-brand-secondary mb-8">The checkout process was cancelled. No charges were made to your account. Feel free to try again when you're ready.</p>
        <div class="space-y-3">
          <button routerLink="/billing/pricing" class="premium-button w-full py-3">Try Again</button>
          <button routerLink="/dashboard" class="w-full py-3 text-brand-secondary hover:text-white transition-colors">Return to Dashboard</button>
        </div>
      </div>
    </div>
  `
})
export class BillingCancelComponent {}
