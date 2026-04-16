import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DashboardActions } from '../../core/state/dashboard/dashboard.actions';
import { selectStats, selectIsLoading } from '../../core/state/dashboard/dashboard.reducer';
import { selectUser } from '../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Welcome Header -->
      <section>
        @if (user$ | async; as user) {
          <h1 class="text-3xl font-bold tracking-tight">Welcome back, <span class="bg-gradient-premium bg-clip-text text-transparent italic">{{ user.firstName }}</span></h1>
        }
        <p class="text-brand-secondary mt-1">Here's what's happening with your business today.</p>
      </section>

      @if (isLoading$ | async) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="glass-panel p-6 animate-pulse">
              <div class="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
              <div class="h-8 bg-white/5 rounded w-3/4"></div>
            </div>
          }
        </div>
      } @else {
        @if (stats$ | async; as stats) {
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="glass-panel p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-sm text-brand-secondary font-medium uppercase tracking-wider">Pipeline Value</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-3xl font-bold">{{ stats.totalDealValue | currency:'USD':'symbol':'1.0-0' }}</h3>
                <span class="text-emerald-400 text-sm font-medium flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">Live</span>
              </div>
            </div>

            <div class="glass-panel p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-sm text-brand-secondary font-medium uppercase tracking-wider">Active Deals</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-3xl font-bold">{{ stats.activeDealsCount }}</h3>
                <span class="text-brand-primary text-sm font-medium flex items-center bg-brand-primary/10 px-2 py-0.5 rounded">In Pipeline</span>
              </div>
            </div>

            <div class="glass-panel p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-sm text-brand-secondary font-medium uppercase tracking-wider">Total Contacts</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-3xl font-bold">{{ stats.totalContacts }}</h3>
                <span class="text-brand-primary text-sm font-medium flex items-center bg-brand-primary/10 px-2 py-0.5 rounded">Network</span>
              </div>
            </div>

            <div class="glass-panel p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-sm text-brand-secondary font-medium uppercase tracking-wider">Task Completion</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-3xl font-bold">{{ stats.taskCompletionRate }}%</h3>
                <div class="w-16 h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div class="h-full bg-brand-primary transition-all duration-1000" [style.width.%]="stats.taskCompletionRate"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Visual Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 glass-panel p-8 min-h-[400px] flex flex-col justify-center items-center text-center">
              <div class="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold">Analytics Engine Active</h2>
              <p class="text-brand-secondary mt-2 max-w-sm">Data from all modules is being aggregated in real-time. Use the sidebar to drill down into specific areas.</p>
              <div class="flex gap-4 mt-8">
                 <button class="premium-button">View CRM Reports</button>
                 <button class="secondary-button !border-white/10 !bg-white/5">Task Board</button>
              </div>
            </div>

            <div class="glass-panel p-6 flex flex-col">
              <h4 class="font-bold mb-6">Recent Activity</h4>
              <div class="space-y-6 flex-1">
                @for (item of stats.recentActivity; track item.id) {
                  <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" [ngClass]="getActivityBg(item.type)">
                      <div class="w-2 h-2 rounded-full" [ngClass]="getActivityColor(item.type)"></div>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium truncate">{{ item.action }}: {{ item.label }}</p>
                      <p class="text-xs text-brand-secondary mt-0.5">{{ item.timestamp | date:'shortTime' }} • {{ item.type }}</p>
                    </div>
                  </div>
                } @empty {
                  <div class="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <p class="text-sm">No recent activity found.</p>
                  </div>
                }
              </div>

              <button class="w-full mt-8 py-2 text-sm text-brand-secondary hover:text-white transition-colors border border-brand-border rounded-lg">View All Activity</button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private store = inject(Store);
  
  stats$ = this.store.select(selectStats);
  isLoading$ = this.store.select(selectIsLoading);
  user$ = this.store.select(selectUser);

  ngOnInit() {
    this.store.dispatch(DashboardActions.loadStats());
  }

  getActivityBg(type: string): string {
    switch(type) {
      case 'CONTACT': return 'bg-indigo-500/10';
      case 'DEAL': return 'bg-emerald-500/10';
      case 'TASK': return 'bg-amber-500/10';
      default: return 'bg-white/5';
    }
  }

  getActivityColor(type: string): string {
    switch(type) {
      case 'CONTACT': return 'bg-indigo-500';
      case 'DEAL': return 'bg-emerald-500';
      case 'TASK': return 'bg-amber-500';
      default: return 'bg-white';
    }
  }
}
