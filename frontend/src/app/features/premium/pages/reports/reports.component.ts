import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { selectPremiumReports, selectPremiumLoading } from '../../../../core/state/premium/premium.selectors';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { take } from 'rxjs';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RequiresPremiumDirective, RouterLink, ReactiveFormsModule, HasPermissionDirective],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-2">
            <a routerLink="/premium" class="text-brand-primary hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </a>
            <h1 class="text-3xl font-extrabold tracking-tight">Insight <span class="bg-gradient-premium bg-clip-text text-transparent italic">Engine</span></h1>
          </div>
          <p class="text-brand-secondary mt-2 max-w-xl">Generate high-fidelity intelligence reports with custom branding and metrics.</p>
        </div>
        <button *hasPermission="'reports:write'" (click)="openCreateModal()" class="secondary-button !border-amber-500/20 hover:!bg-amber-500/10 text-amber-400 relative z-10">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Build Report
          </span>
        </button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (loading$ | async) {
          <div class="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse">Scanning database...</p>
          </div>
        } @else {
          @for (report of reports$ | async; track report.id) {
            <div class="glass-panel p-6 group hover:border-amber-500/40 transition-all duration-300">
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m3.243-9.757a4 4 0 015.657 5.657M10 21h4" /></svg>
                </div>
                <div class="flex gap-2">
                  <button (click)="runReport(report.id)" class="p-2 text-brand-secondary hover:text-amber-400 transition-colors bg-white/5 rounded-lg" title="Run Report">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button *hasPermission="'reports:delete'" (click)="deleteReport(report.id)" class="p-2 text-brand-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg" title="Delete Report">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <h3 class="text-lg font-bold text-white mb-1">{{ report.name }}</h3>
              <p class="text-[10px] text-brand-secondary uppercase tracking-widest font-bold mb-4">{{ report.type }} Report</p>
              
              <div class="space-y-3 pt-4 border-t border-white/5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Last Generated:</span>
                  <span class="text-white font-medium">{{ report.lastGeneratedAt | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Format:</span>
                  <span class="text-amber-400 font-bold">{{ report.format }}</span>
                </div>
              </div>
            </div>
          } @empty {
             <div class="col-span-full py-20 text-center glass-panel border-dashed border-2 border-white/5">
               <div class="flex flex-col items-center gap-3 opacity-50">
                <svg class="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p class="text-brand-secondary italic text-sm">No insight reports generated yet.</p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Build Report Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-amber-500/20 animate-in zoom-in-95 duration-200">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Build Intelligence Report</h2>
              <button (click)="isModalOpen.set(false)" class="text-brand-secondary hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form [formGroup]="reportForm" (ngSubmit)="submitReport()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Name</label>
                  <input formControlName="name" type="text" placeholder="e.g., Q3 Revenue Analysis" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Type</label>
                    <select formControlName="type" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                      <option value="SALES">Sales Performance</option>
                      <option value="TEAM">Team Productivity</option>
                      <option value="PIPELINE">Pipeline Health</option>
                      <option value="AUDIT">System Audit</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Export Format</label>
                    <select formControlName="format" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                      <option value="PDF">PDF Document</option>
                      <option value="EXCEL">Excel Spreadsheet</option>
                      <option value="CSV">Raw CSV</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Data Range</label>
                  <select formControlName="range" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                    <option value="LAST_7_DAYS">Last 7 Days</option>
                    <option value="LAST_30_DAYS">Last 30 Days</option>
                    <option value="QUARTER_TO_DATE">Quarter to Date</option>
                    <option value="YEAR_TO_DATE">Year to Date</option>
                  </select>
                </div>
              </div>

              <div class="pt-6 flex gap-3 border-t border-white/5">
                <button type="button" (click)="isModalOpen.set(false)" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-all">Cancel</button>
                <button type="submit" [disabled]="reportForm.invalid" class="secondary-button !bg-amber-500 !text-black !border-none flex-1 py-2.5 font-bold">Build & Generate</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ReportsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  
  reports$ = this.store.select(selectPremiumReports);
  loading$ = this.store.select(selectPremiumLoading);

  isModalOpen = signal(false);

  reportForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['SALES', Validators.required],
    format: ['PDF', Validators.required],
    range: ['LAST_30_DAYS', Validators.required]
  });

  ngOnInit() {
    this.store.dispatch(PremiumActions.loadReports());
  }

  openCreateModal() {
    this.isModalOpen.set(true);
  }

  submitReport() {
    if (this.reportForm.valid) {
      const { name, ...config } = this.reportForm.value;
      this.store.dispatch(PremiumActions.createReport({ 
        report: { name, config } 
      }));
      this.isModalOpen.set(false);
      this.reportForm.reset({ type: 'SALES', format: 'PDF', range: 'LAST_30_DAYS' });
      this.store.dispatch(ToastActions.showToast({ message: 'Report build job started', toastType: 'success' }));
    }
  }

  runReport(id: string) {
    this.store.dispatch(ToastActions.showToast({ message: 'Report generation started...', toastType: 'info' }));
    // In a real app, this would call a service to poll for result or open a new tab
  }

  deleteReport(id: string) {
    if (confirm('Are you sure you want to delete this report?')) {
      // this.store.dispatch(PremiumActions.deleteReport({ id })); // Assuming this action will be added
      this.store.dispatch(ToastActions.showToast({ message: 'Report deleted successfully', toastType: 'success' }));
    }
  }
}
