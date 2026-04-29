import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLogEntry, AuditLogPage } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Header -->
      <section class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
            Audit <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Trail</span>
          </h1>
          <p class="text-brand-secondary text-xs sm:sm mt-1">A complete history of all changes made in your organization.</p>
        </div>
        <div class="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Admin Only
        </div>
      </section>

      <!-- Stats Bar -->
      @if (pageData()) {
        <div class="glass-panel p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <span class="text-brand-secondary">
            Showing <span class="text-white font-bold">{{ pageData()!.data.length }}</span>
            of <span class="text-white font-bold">{{ pageData()!.total }}</span> events
          </span>
          <div class="flex items-center gap-2 justify-center">
            <button
              (click)="loadPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            >
              ← Prev
            </button>
            <span class="px-2 py-1.5 text-brand-secondary font-medium whitespace-nowrap">
              {{ currentPage() }} / {{ pageData()!.totalPages }}
            </span>
            <button
              (click)="loadPage(currentPage() + 1)"
              [disabled]="currentPage() >= pageData()!.totalPages"
              class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-brand-border hover:border-brand-primary/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[10px] sm:text-xs font-bold uppercase tracking-widest"
            >
              Next →
            </button>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="glass-panel p-12 sm:p-20 flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-brand-secondary animate-pulse text-sm">Loading audit trail...</p>
        </div>
      } @else if (error()) {
        <div class="glass-panel p-8 sm:p-10 text-center">
          <p class="text-rose-400 text-sm">{{ error() }}</p>
          <button class="premium-button mt-4 px-6 py-2 text-xs" (click)="loadPage(1)">Retry</button>
        </div>
      } @else {
        <!-- Audit Log Table -->
        <div class="glass-panel overflow-hidden border border-white/5">
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[800px]">
              <thead>
                <tr class="border-b border-brand-border bg-white/5 text-brand-secondary">
                  <th class="p-4 font-bold uppercase tracking-wider text-[10px]">Timestamp</th>
                  <th class="p-4 font-bold uppercase tracking-wider text-[10px]">User</th>
                  <th class="p-4 font-bold uppercase tracking-wider text-[10px]">Action</th>
                  <th class="p-4 font-bold uppercase tracking-wider text-[10px]">Entity</th>
                  <th class="p-4 font-bold uppercase tracking-wider text-[10px]">IP Address</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-border/30">
                @for (entry of pageData()?.data; track entry.id) {
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="p-4 text-brand-secondary font-mono text-[11px] whitespace-nowrap">
                      {{ entry.createdAt | date:'yyyy-MM-dd HH:mm:ss' }}
                    </td>
                    <td class="p-4">
                      <div class="font-bold text-sm">{{ entry.user.firstName }} {{ entry.user.lastName }}</div>
                      <div class="text-[10px] text-brand-secondary">{{ entry.user.email }}</div>
                    </td>
                    <td class="p-4">
                      <span class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5" [ngClass]="getActionClass(entry.action)">
                        {{ entry.action }}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-brand-secondary border border-white/5">
                          {{ entry.entityType }}
                        </span>
                        <span class="text-brand-secondary font-mono text-[10px] truncate max-w-[100px]" [title]="entry.entityId">
                          {{ entry.entityId | slice:0:8 }}
                        </span>
                      </div>
                    </td>
                    <td class="p-4 font-mono text-[11px] text-brand-secondary">
                      {{ entry.ipAddress ?? '—' }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="p-20 text-center">
                      <div class="flex flex-col items-center gap-3 opacity-40">
                        <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="font-bold">No audit logs found</p>
                        <p class="text-xs">Start using the platform to generate activity records.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditLogService);

  isLoading = signal(true);
  error = signal<string | null>(null);
  pageData = signal<AuditLogPage | null>(null);
  currentPage = signal(1);

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    if (page < 1) return;
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPage.set(page);

    this.auditService.getLogs(page).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load audit logs.');
        this.isLoading.set(false);
      },
    });
  }

  getActionClass(action: AuditLogEntry['action']): string {
    switch (action) {
      case 'CREATE': return 'bg-emerald-500/10 text-emerald-400';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-400';
      case 'DELETE': return 'bg-red-500/10 text-red-400';
      case 'LOGIN':  return 'bg-brand-primary/10 text-brand-primary';
      case 'LOGOUT': return 'bg-slate-500/10 text-slate-400';
      case 'EXPORT': return 'bg-amber-500/10 text-amber-400';
      default:       return 'bg-white/5 text-white';
    }
  }
}
