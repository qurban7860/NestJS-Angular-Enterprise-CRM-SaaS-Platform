import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.reducer';
import { AuthActions } from '../../state/auth/auth.actions';
import { NavService } from '../../services/nav.service';
import { RequiresPremiumDirective } from '../../directives/premium-gate.directive';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { BroadcastingService } from '../../services/broadcasting.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RequiresPremiumDirective,
    HasPermissionDirective,
  ],
  template: `
    <aside
      class="w-64 h-full glass-panel !rounded-none border-y-0 border-l-0 flex flex-col relative"
    >
      <!-- Close Button for Mobile -->
      <button
        (click)="navService.closeSidebar()"
        class="lg:hidden absolute top-5 right-1 p-2 text-brand-secondary hover:text-white transition-colors"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="p-6">
        <div
          class="flex items-center gap-3 cursor-pointer"
          routerLink="/dashboard"
          (click)="navService.closeSidebar()"
        >
          <div
            class="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center font-bold text-white shadow-lg overflow-hidden"
          >
            <img
              src="assets/astraeus_logo_3d.png"
              alt="A"
              class="w-full h-full object-cover"
            />
          </div>
          <span class="text-xl font-bold tracking-tight"
            >Astraeus <span class="text-brand-primary">CRM</span></span
          >
        </div>
        <!-- @if (user$ | async; as user) {
          @if (user.orgName) {
            <div
              class="mt-4 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-2"
            >
              <svg
                class="w-3 h-3 text-brand-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"
                />
              </svg>
              <span
                class="text-[10px] font-bold uppercase tracking-widest text-brand-primary truncate"
                >{{ user.orgName }}</span
              >
            </div>
          }
        } -->
      </div>

      <nav class="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        <!-- Main -->
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            Main
          </p>
          <div class="space-y-1">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard
            </a>
          </div>
        </div>

        <!-- CRM -->
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            CRM
          </p>
          <div class="space-y-1">
            <a
              *hasPermission="'contacts:read'"
              routerLink="/crm/contacts"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Contacts
            </a>
            <a
              *hasPermission="'deals:read'"
              routerLink="/crm/deals"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Deals
            </a>
          </div>
        </div>

        <!-- Work -->
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            Work
          </p>
          <div class="space-y-1">
            <a
              *hasPermission="'tasks:read'"
              routerLink="/tasks"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              Tasks
            </a>
          </div>
        </div>

        <!-- System (Admin) -->
        <div *hasPermission="['system:audit']">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            System
          </p>
          <div class="space-y-1">
            <a
              *hasPermission="'system:audit'"
              routerLink="/system/audit-logs"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Audit Trail
            </a>
          </div>
        </div>

        <!-- Administration -->
        <div *hasPermission="['team:read', 'roles:read', 'broadcast:write']; requireAll: false">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            Administration
          </p>
          <div class="space-y-1">
            <a
              *hasPermission="'team:read'"
              routerLink="/premium/team"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Team Members
            </a>
            <a
              *hasPermission="'roles:read'"
              routerLink="/premium/roles"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Custom Roles
            </a>
            <a
              *hasPermission="'broadcast:write'"
              routerLink="/premium/broadcasting"
              routerLinkActive="active"
              class="nav-link group"
              (click)="navService.closeSidebar()"
            >
              <svg
                class="w-5 h-5 mr-3 text-indigo-400 group-hover:animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              Signal Center
              @if (broadcastService.activeBroadcasts().length > 0) {
                <span class="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              }
            </a>
          </div>
        </div>

        <!-- Automation & Insights -->
        <div *hasPermission="['workflows:read', 'reports:read']; requireAll: false">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            Intelligence
          </p>
          <div class="space-y-1">
            <a
              *hasPermission="'workflows:read'"
              routerLink="/premium/workflows"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Workflows
            </a>
            <a
              *hasPermission="'reports:read'"
              routerLink="/premium/reports"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Reports
            </a>
          </div>
        </div>

        <!-- Billing -->
        <div *ngIf="(user$ | async)?.role === 'ADMIN' || (user$ | async)?.role === 'MANAGER'">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60 px-3 mb-2"
          >
            Billing
          </p>
          <div class="space-y-1">
            <a
              routerLink="/billing/pricing"
              routerLinkActive="active"
              class="nav-link"
              (click)="navService.closeSidebar()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 mr-3 text-brand-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Upgrade Plan
            </a>
          </div>
        </div>
      </nav>

      <!-- User Profile & Logout -->
      <div class="p-4 border-t border-brand-border space-y-2">
        @if (user$ | async; as user) {
          <div class="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div
              class="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0"
            >
              <span class="text-indigo-400 font-bold text-sm"
                >{{ user.firstName?.[0] || ''
                }}{{ user.lastName?.[0] || '' }}</span
              >
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="flex items-center gap-2 min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ user.firstName }} {{ user.lastName }}
                </p>

                <span
                  class="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/20 shrink-0"
                >
                  {{ user.customRole?.name || user.role }}
                </span>

                @if (user.customRole) {
                  <span
                    class="text-[9px] text-brand-secondary/60 italic font-medium shrink-0"
                  >
                    Custom Role
                  </span>
                }
              </div>

              <p class="text-xs text-brand-secondary truncate mt-1">
                {{ user.email }}
              </p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-brand-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
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
  navService = inject(NavService);
  broadcastService = inject(BroadcastingService);
  user$ = this.store.select(selectUser);

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
