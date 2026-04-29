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
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { PremiumService } from '../../../../core/services/premium.service';
import { ButtonComponent } from '../../../../core/components/button/button.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RequiresPremiumDirective, RouterLink, ReactiveFormsModule, HasPermissionDirective, ConfirmModalComponent, ButtonComponent],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Intelligence <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Studio</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Generate high-fidelity intelligence reports with custom branding and metrics.</p>
        </div>
        <app-button variant="secondary" (clicked)="openCreateModal()" class="secondary-button !border-amber-500/10 hover!bg-amber-500/10 text-amber-400 relative z-10">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Build Report
          </span>
        </app-button>
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
                  <button [disabled]="isSubmitting()" (click)="executeReport(report)" class="p-2 text-brand-secondary hover:text-amber-400 transition-colors bg-white/5 rounded-lg disabled:opacity-50" title="Run Report">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button *hasPermission="'reports:delete'" [disabled]="isSubmitting()" (click)="deleteReport(report)" class="p-2 text-brand-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg disabled:opacity-50" title="Delete Report">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <h3 class="text-lg font-bold text-white mb-1">{{ report.name }}</h3>
              <p class="text-[10px] text-brand-secondary uppercase tracking-widest font-bold mb-4">{{ report.config?.type || 'UNKNOWN' }} Report</p>
              
              <div class="space-y-3 pt-4 border-t border-white/5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Last Generated:</span>
                  <span class="text-white font-medium">{{ report.lastGeneratedAt | date:'MMM d, yyyy' }}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Format:</span>
                  <span class="text-amber-400 font-bold">{{ report.config?.format || 'PDF' }}</span>
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
          <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-amber-500/20 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">Build Intelligence Report</h2>

            <form [formGroup]="reportForm" (ngSubmit)="submitReport()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Name</label>
                  <input formControlName="name" type="text" placeholder="e.g., Q2 Sales Performance" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all outline-none ring-0 focus:ring-2 focus:ring-amber-500/30">
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Type</label>
                    <select formControlName="type" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                      <option value="SALES">Sales Activity</option>
                      <option value="CRM">CRM Health</option>
                      <option value="PERFORMANCE">Team Performance</option>
                      <option value="PIPELINE">Pipeline Forecast</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Export Format</label>
                    <select formControlName="format" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer">
                      <option value="PDF">Interactive PDF</option>
                      <option value="EXCEL">Excel Spreadsheet</option>
                      <option value="CSV">Raw CSV</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
                  <textarea formControlName="description" rows="2" placeholder="Briefly describe the objective of this report..." 
                   class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all resize-none outline-none ring-0 focus:ring-2 focus:ring-amber-500/30"></textarea>
                 </div>
              </div>

              <div class="pt-6 flex gap-3 border-t border-white/5">
                <app-button type="button" variant="secondary" [disabled]="isSubmitting()" (clicked)="isModalOpen.set(false)" customClass="flex-1 py-3 justify-center">Cancel</app-button>
                <app-button type="submit" [disabled]="reportForm.invalid || isSubmitting()" [loading]="isSubmitting()" variant="premium" customClass="!bg-amber-500 !text-black !border-none flex-1 py-3 justify-center font-bold">
                   Build Report
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (isConfirmDeleteOpen()) {
        <app-confirm-modal
          title="Delete Report"
          [message]="'Are you sure you want to delete ' + selectedReport()?.name + '? This will permanently remove all historical snapshots of this report.'"
          confirmText="Delete Report"
          [loading]="isSubmitting()"
          (confirm)="confirmDelete()"
          (cancel)="isConfirmDeleteOpen.set(false)"
        ></app-confirm-modal>
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
  private premiumService = inject(PremiumService);
  
  reports$ = this.store.select(selectPremiumReports);
  loading$ = this.store.select(selectPremiumLoading);

  isModalOpen = signal(false);
  isConfirmDeleteOpen = signal(false);
  isSubmitting = signal(false);
  selectedReport = signal<any>(null);

  reportForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
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
      const { name, description, ...config } = this.reportForm.value;
      this.isSubmitting.set(true);
      this.store.dispatch(PremiumActions.createReport({ 
        report: { name, description, config } 
      }));
      
      setTimeout(() => {
        this.isModalOpen.set(false);
        this.isSubmitting.set(false);
        this.reportForm.reset({ type: 'SALES', format: 'PDF', range: 'LAST_30_DAYS' });
        this.store.dispatch(ToastActions.showToast({ message: 'Report build job started', toastType: 'success' }));
      }, 500);
    }
  }

  executeReport(report: any) {
    this.isSubmitting.set(true);
    this.store.dispatch(ToastActions.showToast({ message: `Generating ${report.name} (${report.config?.format || 'PDF'})...`, toastType: 'info' }));
    
    this.premiumService.runReport(report.id).pipe(take(1)).subscribe({
      next: (result) => {
        this.store.dispatch(ToastActions.showToast({ message: 'Report generated successfully!', toastType: 'success' }));
        // Simulate download or open
        if (result.url) {
          window.open(result.url, '_blank');
        }
        this.store.dispatch(PremiumActions.loadReports());
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.store.dispatch(ToastActions.showToast({ message: 'Failed to generate report', toastType: 'error' }));
        this.isSubmitting.set(false);
      }
    });
  }

  deleteReport(report: any) {
    this.selectedReport.set(report);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const report = this.selectedReport();
    if (report) {
      this.isSubmitting.set(true);
      this.store.dispatch(PremiumActions.deleteReport({ id: report.id }));
      setTimeout(() => {
        this.isConfirmDeleteOpen.set(false);
        this.isSubmitting.set(false);
        this.store.dispatch(ToastActions.showToast({ message: 'Report deleted successfully', toastType: 'success' }));
      }, 500);
    }
  }
}
