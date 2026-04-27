import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectQuotaExceededPayload } from '../../../../core/state/premium/premium.selectors';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="payload$ | async as payload" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <div class="icon-container">
            <i class="pi pi-bolt"></i>
          </div>
          <h2>Upgrade to Unlock More</h2>
        </div>
        
        <div class="modal-body">
          <p>You've reached the free limit for <strong>{{ formatFeatureName(payload.feature) }}</strong>.</p>
          
          <div class="quota-stats">
            <div class="stat">
              <span class="label">Current Usage</span>
              <span class="value">{{ payload.currentCount }}</span>
            </div>
            <div class="stat">
              <span class="label">Plan Limit</span>
              <span class="value">{{ payload.limit }}</span>
            </div>
          </div>
          
          <p class="promo-text">
            Upgrade to a Premium plan to get unlimited {{ formatFeatureName(payload.feature) }}, 
            advanced workflows, and custom reporting.
          </p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="close()">Maybe Later</button>
          <button class="btn-primary" (click)="upgrade()">Upgrade Now</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-content {
      background: #ffffff;
      border-radius: 16px;
      width: 90%;
      max-width: 450px;
      padding: 32px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: translateY(0);
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .icon-container {
      width: 64px;
      height: 64px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 24px;
    }

    h2 {
      margin: 0;
      color: #111827;
      font-size: 24px;
      font-weight: 700;
    }

    .modal-body {
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .quota-stats {
      display: flex;
      background: #f9fafb;
      border-radius: 12px;
      padding: 16px;
      margin: 20px 0;
      gap: 16px;
    }

    .stat {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .value {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .promo-text {
      font-size: 14px;
      text-align: center;
    }

    .modal-footer {
      display: flex;
      gap: 12px;
    }

    button {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class UpgradeModalComponent {
  private store = inject(Store);
  private router = inject(Router);

  payload$ = this.store.select(selectQuotaExceededPayload);

  formatFeatureName(feature: string): string {
    if (!feature) return '';
    return feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  close(): void {
    this.store.dispatch(PremiumActions.clearQuotaError());
  }

  upgrade(): void {
    this.close();
    this.router.navigate(['/billing/upgrade']);
  }
}
