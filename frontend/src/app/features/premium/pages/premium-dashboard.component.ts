import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequiresPremiumDirective } from '../../../core/directives/premium-gate.directive';
import { PremiumUpgradePromptComponent } from '../components/premium-upgrade-prompt.component';
import { RouterLink } from '@angular/router';
import { PremiumService } from '../../../core/services/premium.service';
import { inject, signal, OnInit } from '@angular/core';
import { take } from 'rxjs';

@Component({
  selector: 'app-premium-dashboard',
  standalone: true,
  imports: [CommonModule, RequiresPremiumDirective, PremiumUpgradePromptComponent, RouterLink],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel overflow-hidden relative gap-6">
        <div class="relative z-10 flex-1">
          <h1 class="text-3xl font-extrabold tracking-tight">Premium <span class="bg-gradient-premium bg-clip-text text-transparent italic">Hub</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Manage your organization's high-level security, automation, and intelligence tools from one unified interface.</p>
        </div>
        
        <!-- Team Stats -->
        <div class="relative z-10 bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex flex-col items-center justify-center min-w-[140px]">
          <span class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 mb-1">Org Members</span>
          <div class="flex items-center gap-2">
            @if (loading()) {
              <div class="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            } @else {
              <span class="text-2xl font-black text-white">{{ memberCount() }}</span>
            }
          </div>
        </div>

        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <!-- Feature Grid - Visible to all, but actions are gated on sub-pages -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Custom Roles -->
        <div class="glass-panel p-8 group hover:border-brand-primary/40 transition-all duration-300 flex flex-col relative overflow-hidden">
          <div class="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v12m0 0h6a2 2 0 002-2v-3.5a1 1 0 00-1-1h-1m-6.12 4.12l-.5.5M7 7l.5.5"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Enterprise RBAC</h3>
          <p class="text-brand-secondary text-sm mb-6 flex-1">Create custom roles with granular permissions down to the individual field level.</p>
          <button routerLink="roles" class="premium-button w-full">Define Roles</button>
        </div>

        <!-- Automation -->
        <div class="glass-panel p-8 group hover:border-emerald-500/40 transition-all duration-300 flex flex-col relative overflow-hidden">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Logic Automations</h3>
          <p class="text-brand-secondary text-sm mb-6 flex-1">Build complex conditional workflows that sync your CRM, Tasks, and External tools.</p>
          <button routerLink="workflows" class="secondary-button w-full !border-emerald-500/20 hover:!bg-emerald-500/10 text-emerald-400">Flow Builder</button>
        </div>

        <!-- Intelligence -->
        <div class="glass-panel p-8 group hover:border-amber-500/40 transition-all duration-300 flex flex-col relative overflow-hidden">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <h3 class="text-xl font-bold mb-3 text-white">Insight Engine</h3>
          <p class="text-brand-secondary text-sm mb-6 flex-1">Generate deep-insight PDF and Excel reports with your own custom branding and metrics.</p>
          <button routerLink="reports" class="secondary-button w-full !border-amber-500/20 hover:!bg-amber-500/10 text-amber-400">Build Reports</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class PremiumDashboardComponent implements OnInit {
  private premiumService = inject(PremiumService);
  
  memberCount = signal(0);
  loading = signal(false);

  ngOnInit() {
    this.loading.set(true);
    this.premiumService.getOrgUsers().pipe(take(1)).subscribe({
      next: (users) => {
        this.memberCount.set(users.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
