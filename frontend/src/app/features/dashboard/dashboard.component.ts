import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { DashboardActions } from '../../core/state/dashboard/dashboard.actions';
import { selectStats, selectIsLoading } from '../../core/state/dashboard/dashboard.reducer';
import { selectUser } from '../../core/state/auth/auth.reducer';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 sm:y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Welcome Header -->
      <section>
        @if (user$ | async; as user) {
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, <span class="bg-gradient-premium bg-clip-text text-transparent italic">{{ user.firstName }}</span></h1>
        }
        <p class="text-brand-secondary text-sm sm:text-base mt-1">Here's what's happening with your business today.</p>
      </section>

      @if (isLoading$ | async) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div routerLink="/crm/deals" class="glass-panel p-5 sm:p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-[10px] sm:text-sm text-brand-secondary font-medium uppercase tracking-wider">Pipeline Value</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-2xl sm:text-3xl font-bold">{{ stats.totalDealValue | currency:'USD':'symbol':'1.0-0' }}</h3>
                <span class="text-emerald-400 text-[10px] sm:text-sm font-medium flex items-center bg-emerald-400/10 px-2 py-0.5 rounded">Live</span>
              </div>
            </div>

            <div routerLink="/crm/deals" class="glass-panel p-5 sm:p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-[10px] sm:text-sm text-brand-secondary font-medium uppercase tracking-wider">Active Deals</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-2xl sm:text-3xl font-bold">{{ stats.activeDealsCount }}</h3>
                <span class="text-brand-primary text-[10px] sm:text-sm font-medium flex items-center bg-brand-primary/10 px-2 py-0.5 rounded">In Pipeline</span>
              </div>
            </div>

            <div routerLink="/crm/contacts" class="glass-panel p-5 sm:p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-[10px] sm:text-sm text-brand-secondary font-medium uppercase tracking-wider">Total Contacts</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-2xl sm:text-3xl font-bold">{{ stats.totalContacts }}</h3>
                <span class="text-brand-primary text-[10px] sm:text-sm font-medium flex items-center bg-brand-primary/10 px-2 py-0.5 rounded">Network</span>
              </div>
            </div>

            <div routerLink="/tasks" class="glass-panel p-5 sm:p-6 hover:border-brand-primary/30 transition-colors cursor-pointer group">
              <p class="text-[10px] sm:text-sm text-brand-secondary font-medium uppercase tracking-wider">Task Completion</p>
              <div class="flex items-end justify-between mt-2">
                <h3 class="text-2xl sm:text-3xl font-bold">{{ stats.taskCompletionRate }}%</h3>
                <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div class="h-full bg-brand-primary transition-all duration-1000" [style.width.%]="stats.taskCompletionRate"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Visual Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 glass-panel p-5 sm:p-8 flex flex-col min-h-[400px]">
              <!-- Section Header & Buttons -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 class="text-lg sm:text-xl font-bold">Performance Overview</h2>
                  <p class="text-brand-secondary text-xs sm:text-sm mt-1">Real-time CRM and Task metrics</p>
                </div>
                <div class="flex flex-wrap gap-2 sm:gap-3">
                   <button routerLink="/crm/deals" class="premium-button text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">CRM Reports</button>
                   <button routerLink="/tasks" class="secondary-button text-xs sm:text-sm px-3 sm:px-4 py-2 !border-white/10 !bg-white/5 whitespace-nowrap">Task Board</button>
                </div>
              </div>

              <!-- Data Visualizations -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 mt-6">
                <!-- CRM Pipeline Report -->
                <div class="space-y-4">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-secondary mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Deal Pipeline
                  </h3>
                  <div class="space-y-4">
                    <div class="group">
                      <div class="flex justify-between text-[10px] sm:text-xs mb-1.5">
                        <span class="text-brand-secondary group-hover:text-white transition-colors">Prospecting</span>
                        <span class="font-bold text-white">{{ stats.totalDealValue * 0.3 | currency:'USD':'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="w-full h-2 sm:h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500/60 rounded-full group-hover:bg-emerald-500 transition-all duration-300" style="width: 30%"></div>
                      </div>
                    </div>
                    <div class="group">
                      <div class="flex justify-between text-[10px] sm:text-xs mb-1.5">
                        <span class="text-brand-secondary group-hover:text-white transition-colors">Qualification</span>
                        <span class="font-bold text-white">{{ stats.totalDealValue * 0.2 | currency:'USD':'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="w-full h-2 sm:h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-500/60 rounded-full group-hover:bg-blue-500 transition-all duration-300" style="width: 20%"></div>
                      </div>
                    </div>
                    <div class="group">
                      <div class="flex justify-between text-[10px] sm:text-xs mb-1.5">
                        <span class="text-brand-secondary group-hover:text-white transition-colors">Negotiation</span>
                        <span class="font-bold text-white">{{ stats.totalDealValue * 0.5 | currency:'USD':'symbol':'1.0-0' }}</span>
                      </div>
                      <div class="w-full h-2 sm:h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-500/60 rounded-full group-hover:bg-indigo-500 transition-all duration-300" style="width: 50%"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Task Distribution Bar Chart -->
                <div class="space-y-4">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-brand-secondary mb-4 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Task Distribution
                  </h3>
                  <div class="flex items-end gap-3 sm:gap-4 h-32 pt-4 border-b border-brand-border/50 pb-1">
                    <div class="flex-1 flex flex-col justify-end items-center group relative h-full">
                      <span class="absolute -top-6 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">12</span>
                      <div class="w-full bg-white/10 rounded-t-md group-hover:bg-amber-500/80 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]" style="height: 35%"></div>
                      <span class="text-[8px] sm:text-[10px] mt-3 text-brand-secondary uppercase font-medium">To Do</span>
                    </div>
                    <div class="flex-1 flex flex-col justify-end items-center group relative h-full">
                      <span class="absolute -top-6 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">8</span>
                      <div class="w-full bg-brand-primary/40 rounded-t-md group-hover:bg-brand-primary/80 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]" style="height: 55%"></div>
                      <span class="text-[8px] sm:text-[10px] mt-3 text-brand-secondary uppercase font-medium">Doing</span>
                    </div>
                    <div class="flex-1 flex flex-col justify-end items-center group relative h-full">
                      <span class="absolute -top-6 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">24</span>
                      <div class="w-full bg-emerald-500/40 rounded-t-md group-hover:bg-emerald-500/80 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]" style="height: 100%"></div>
                      <span class="text-[8px] sm:text-[10px] mt-3 text-brand-secondary uppercase font-medium">Done</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="mt-12 sm:mt-20 pt-8 border-t border-brand-border/30 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                 <div class="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group" routerLink="/crm/contacts">
                   <div class="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                   </div>
                   <div class="min-w-0">
                     <p class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Add Contact</p>
                     <p class="text-[10px] sm:text-xs text-brand-secondary truncate">Grow your network</p>
                   </div>
                 </div>
                 <div class="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group" routerLink="/crm/deals">
                   <div class="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                   </div>
                   <div class="min-w-0">
                     <p class="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">New Deal</p>
                     <p class="text-[10px] sm:text-xs text-brand-secondary truncate">Expand pipeline</p>
                   </div>
                 </div>
                 <div class="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group sm:col-span-2 xl:col-span-1" routerLink="/tasks">
                   <div class="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors shrink-0">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                   </div>
                   <div class="min-w-0">
                     <p class="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Create Task</p>
                     <p class="text-[10px] sm:text-xs text-brand-secondary truncate">Assign work</p>
                   </div>
                 </div>
              </div>
            </div>

            <div class="glass-panel p-5 sm:p-6 flex flex-col min-h-[400px]">
              <h4 class="font-bold mb-6">Recent Activity</h4>
              <div class="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                @for (item of stats.recentActivity; track item.id) {
                  <div class="flex gap-3 sm:gap-4 group">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" [ngClass]="getActivityBg(item.type)">
                      <div class="w-2 h-2 rounded-full" [ngClass]="getActivityColor(item.type)"></div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-medium truncate group-hover:text-brand-primary transition-colors">{{ item.action }}: {{ item.label }}</p>
                      <p class="text-[10px] sm:text-xs text-brand-secondary mt-0.5">{{ item.timestamp | date:'shortTime' }} • {{ item.type }}</p>
                    </div>
                  </div>
                } @empty {
                  <div class="flex flex-col items-center justify-center h-full text-center opacity-40">
                    <p class="text-sm">No recent activity found.</p>
                  </div>
                }
              </div>

              <button routerLink="/system/audit-logs" class="w-full mt-8 py-2 text-xs sm:text-sm text-brand-secondary hover:text-white transition-colors border border-brand-border rounded-lg hover:bg-white/5 whitespace-nowrap">View All Activity</button>
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
