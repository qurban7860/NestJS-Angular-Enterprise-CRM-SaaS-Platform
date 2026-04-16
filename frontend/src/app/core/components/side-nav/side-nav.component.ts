import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.reducer';
import { AuthActions } from '../../state/auth/auth.actions';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 h-full glass-panel !rounded-none border-y-0 border-l-0 flex flex-col">
      <div class="p-6">
        <div class="flex items-center gap-3 cursor-pointer" routerLink="/dashboard">
          <div class="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center font-bold text-white shadow-lg">E</div>
          <span class="text-xl font-bold tracking-tight">Enterprise <span class="text-brand-primary">SaaS</span></span>
        </div>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        <!-- Main -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2">Main</p>
          <div class="space-y-1">
            <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </a>
          </div>
        </div>

        <!-- CRM -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2">CRM</p>
          <div class="space-y-1">
            <a routerLink="/crm/contacts" routerLinkActive="active" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Contacts
            </a>
            <a routerLink="/crm/deals" routerLinkActive="active" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Deals
            </a>
          </div>
        </div>

        <!-- Work -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2">Work</p>
          <div class="space-y-1">
            <a routerLink="/tasks" routerLinkActive="active" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Tasks
            </a>
          </div>
        </div>

        <!-- System (Admin) -->
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2">System</p>
          <div class="space-y-1">
            <a routerLink="/system/audit-logs" routerLinkActive="active" class="nav-link">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Audit Trail
            </a>
          </div>
        </div>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-brand-border space-y-2">
        @if (user$ | async; as user) {
          <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div class="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span class="text-indigo-400 font-bold text-sm">{{ user.firstName[0] }}{{ user.lastName[0] }}</span>
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-medium truncate">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="text-xs text-brand-secondary truncate">{{ user.email }}</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-brand-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        } @else {
          <div class="animate-pulse flex items-center gap-3 p-3">
            <div class="w-9 h-9 rounded-full bg-white/5"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-white/5 rounded w-3/4"></div>
              <div class="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          </div>
        }
      </div>
    </aside>
  `,
})
export class SideNavComponent {
  private store = inject(Store);
  user$ = this.store.select(selectUser);

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}


