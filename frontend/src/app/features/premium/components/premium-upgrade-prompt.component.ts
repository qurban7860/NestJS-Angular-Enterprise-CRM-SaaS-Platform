import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-premium-upgrade-prompt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="premium-card">
      <div class="glow-bg"></div>
      <div class="content">
        <div class="icon-badge">
          <i class="pi pi-star-fill"></i>
        </div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
        
        <ul class="feature-list">
          <li><i class="pi pi-check"></i> Advanced RBAC & Custom Roles</li>
          <li><i class="pi pi-check"></i> Automated Workflows</li>
          <li><i class="pi pi-check"></i> Custom Dashboards & Export</li>
          <li><i class="pi pi-check"></i> Full Audit History</li>
        </ul>

        <button class="upgrade-btn" (click)="onUpgrade()">
          Unlock Premium Tier
          <i class="pi pi-arrow-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .premium-card {
      position: relative;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      overflow: hidden;
      max-width: 500px;
      margin: 2rem auto;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .glow-bg {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%);
      z-index: 0;
      animation: rotate 20s linear infinite;
    }

    .content {
      position: relative;
      z-index: 1;
    }

    .icon-badge {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #7c3aed, #db2777);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 24px;
      color: white;
      box-shadow: 0 8px 16px rgba(124, 58, 237, 0.4);
    }

    h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      background: linear-gradient(to right, #fff, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 32px;
      text-align: left;
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #cbd5e1;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .feature-list i {
      color: #10b981;
    }

    .upgrade-btn {
      width: 100%;
      padding: 14px 24px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .upgrade-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(124, 58, 237, 0.4);
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class PremiumUpgradePromptComponent {
  private router = inject(Router);

  @Input() title = 'Premium Feature Locked';
  @Input() description = 'Upgrade your plan to access advanced multi-tenant controls, automation, and reporting.';

  onUpgrade() {
    this.router.navigate(['/billing/upgrade']);
  }
}
