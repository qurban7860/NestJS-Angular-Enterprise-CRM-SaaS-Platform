import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { selectPremiumReports, selectPremiumLoading } from '../../../../core/state/premium/premium.selectors';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { PremiumService } from '../../../../core/services/premium.service';
import { ButtonComponent } from '../../../../core/components/button/button.component';
import { take } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const REPORT_TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  SALES: {
    label: 'Sales Activity',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>`,
    color: 'amber'
  },
  CRM: {
    label: 'CRM Health',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>`,
    color: 'blue'
  },
  PERFORMANCE: {
    label: 'Team Performance',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
    color: 'purple'
  },
  PIPELINE: {
    label: 'Pipeline Forecast',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>`,
    color: 'emerald'
  }
};

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    RequiresPremiumDirective,
    RouterLink,
    ReactiveFormsModule,
    HasPermissionDirective,
    ConfirmModalComponent,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Page Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Intelligence <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Studio</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl text-sm">Generate high-fidelity intelligence reports with custom metrics. Export as PDF, Excel, or CSV.</p>
        </div>
        <app-button *hasPermission="'reports:write'" variant="premium" (clicked)="openCreateModal()" customClass="relative z-10 justify-center py-3 px-6 !bg-amber-500 !border-amber-500/30">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Build Report
          </span>
        </app-button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <!-- Reports Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (loading$ | async) {
          <div class="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse text-sm">Scanning intelligence database...</p>
          </div>
        } @else {
          @for (report of reports$ | async; track report.id) {
            <div class="glass-panel p-6 group hover:border-amber-500/40 transition-all duration-300 hover:shadow-amber-500/5 hover:shadow-xl flex flex-col">
              <!-- Card Header -->
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center border"
                  [class]="getTypeColorClass(report.config?.type)">
                  <span [innerHTML]="getTypeIcon(report.config?.type)"></span>
                </div>
                <div class="flex items-center gap-2">
                  <!-- Format badge -->
                  <span class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border"
                    [class]="getFormatBadgeClass(report.config?.format)">
                    {{ report.config?.format || 'PDF' }}
                  </span>
                </div>
              </div>

              <h3 class="text-sm font-bold text-white mb-1 line-clamp-1">{{ report.name }}</h3>
              <p class="text-[10px] text-amber-400/80 uppercase tracking-widest font-bold mb-2">
                {{ getTypeLabel(report.config?.type) }} Report
              </p>
              <p class="text-xs text-brand-secondary line-clamp-2 mb-4 flex-1 leading-relaxed">
                {{ report.description || 'No description provided.' }}
              </p>

              <!-- Meta -->
              <div class="space-y-2 pt-3 border-t border-white/5">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Date Range:</span>
                  <span class="text-white font-medium text-[11px]">{{ getRangeLabel(report.config?.range) }}</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-brand-secondary">Last Generated:</span>
                  <span class="text-white font-medium text-[11px]">
                    {{ report.lastGeneratedAt ? (report.lastGeneratedAt | date:'MMM d, yyyy') : 'Never' }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button [disabled]="isRunning(report.id)"
                  (click)="executeReport(report)"
                  class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  @if (isRunning(report.id)) {
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  } @else {
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download
                  }
                </button>
                <button *hasPermission="'reports:delete'"
                  [disabled]="isSubmitting()"
                  (click)="deleteReport(report)"
                  class="p-2 text-brand-secondary hover:text-red-400 transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-red-500/20 disabled:opacity-40">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-24 text-center glass-panel border-dashed border-2 border-white/5">
              <div class="flex flex-col items-center gap-4 opacity-40">
                <svg class="w-14 h-14 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <div>
                  <p class="text-base font-bold">No reports built yet</p>
                  <p class="text-sm mt-1 text-brand-secondary">Create your first intelligence report to gain insights.</p>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ── Build Report Modal (outside animate-in to fix fixed positioning) -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-amber-500/20 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
          <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="mb-6">
            <h2 class="text-2xl font-bold">Build Intelligence Report</h2>
            <p class="text-sm text-brand-secondary mt-1">Configure the report template and export format.</p>
          </div>

          <form [formGroup]="reportForm" (ngSubmit)="submitReport()" class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Name <span class="text-red-400">*</span></label>
              <input formControlName="name" type="text" placeholder="e.g., Q2 Sales Performance"
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all outline-none ring-0 focus:ring-2 focus:ring-amber-500/30"
                [ngClass]="{'border-red-500/50': reportForm.get('name')?.invalid && reportForm.get('name')?.touched}">
              @if (reportForm.get('name')?.invalid && reportForm.get('name')?.touched) {
                <p class="text-red-400 text-xs mt-1">Report name is required (min 3 characters).</p>
              }
            </div>

            <!-- Type & Format -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Report Type <span class="text-red-400">*</span></label>
                <select formControlName="type" class="custom-select focus:ring-amber-500/30 focus:border-amber-500/50">
                  <option value="SALES">Sales Activity</option>
                  <option value="CRM">CRM Health</option>
                  <option value="PERFORMANCE">Team Performance</option>
                  <option value="PIPELINE">Pipeline Forecast</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Export Format <span class="text-red-400">*</span></label>
                <select formControlName="format" class="custom-select focus:ring-amber-500/30 focus:border-amber-500/50">
                  <option value="PDF">HTML Report (Print to PDF)</option>
                  <option value="EXCEL">TSV Spreadsheet (Excel import)</option>
                  <option value="CSV">CSV Data (Raw)</option>
                </select>
              </div>
            </div>

            <!-- Date Range -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Date Range <span class="text-red-400">*</span></label>
              <select formControlName="range" class="custom-select focus:ring-amber-500/30 focus:border-amber-500/50">
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="LAST_90_DAYS">Last 90 Days (Quarter)</option>
                <option value="LAST_365_DAYS">Last 365 Days (Year)</option>
                <option value="ALL_TIME">All Time</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
              <textarea formControlName="description" rows="2" placeholder="Briefly describe the objective of this report..."
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all resize-none outline-none ring-0 focus:ring-2 focus:ring-amber-500/30"></textarea>
            </div>

            <!-- Submit -->
            <div class="pt-5 flex gap-3 border-t border-white/5">
              <app-button type="button" variant="secondary" [disabled]="isSubmitting()" (clicked)="isModalOpen.set(false)" customClass="flex-1 py-3 justify-center">Cancel</app-button>
              <app-button type="submit"
                [disabled]="reportForm.invalid || isSubmitting()"
                [loading]="isSubmitting()"
                variant="premium"
                customClass="!bg-amber-500 !text-black !border-none flex-1 py-3 justify-center font-bold">
                Build Report
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Delete Modal (outside animate-in to fix fixed positioning) -->
    @if (isConfirmDeleteOpen()) {
      <app-confirm-modal
        title="Delete Report"
        [message]="'Delete &quot;' + selectedReport()?.name + '&quot;? All historical snapshots will be permanently removed.'"
        confirmText="Delete Report"
        [loading]="isSubmitting()"
        (confirm)="confirmDelete()"
        (cancel)="isConfirmDeleteOpen.set(false)">
      </app-confirm-modal>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ReportsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private premiumService = inject(PremiumService);
  private sanitizer = inject(DomSanitizer);

  reports$ = this.store.select(selectPremiumReports);
  loading$ = this.store.select(selectPremiumLoading);

  isModalOpen = signal(false);
  isConfirmDeleteOpen = signal(false);
  isSubmitting = signal(false);
  selectedReport = signal<any>(null);

  // Per-report running state
  private runningReports = new Set<string>();

  reportForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    type: ['SALES', Validators.required],
    format: ['PDF', Validators.required],
    range: ['LAST_30_DAYS', Validators.required],
  });

  ngOnInit() {
    this.store.dispatch(PremiumActions.loadReports());
  }

  openCreateModal() {
    this.reportForm.reset({ type: 'SALES', format: 'PDF', range: 'LAST_30_DAYS' });
    this.isModalOpen.set(true);
  }

  submitReport() {
    if (this.reportForm.invalid) return;
    const { name, description, type, format, range } = this.reportForm.value;

    // Map frontend display type to backend engine type
    const typeMap: Record<string, string> = {
      SALES_ACTIVITY:     'SALES',
      CRM_HEALTH:         'CRM',
      TEAM_PERFORMANCE:   'PERFORMANCE',
      PIPELINE_FORECAST:  'PIPELINE',
    };
    const engineType = typeMap[type ?? ''] ?? type ?? 'SALES';
    const config = { type: engineType, format, range };

    this.isSubmitting.set(true);
    this.store.dispatch(PremiumActions.createReport({ report: { name, description, config } }));

    setTimeout(() => {
      this.isModalOpen.set(false);
      this.isSubmitting.set(false);
      this.store.dispatch(ToastActions.showToast({
        message: `Report "${name}" created. Click Run to generate & download.`,
        toastType: 'success'
      }));
    }, 600);
  }

  isRunning(reportId: string): boolean {
    return this.runningReports.has(reportId);
  }

  executeReport(report: any) {
    if (this.runningReports.has(report.id)) return;
    this.runningReports.add(report.id);

    const format: string = (report.config?.format || 'PDF').toUpperCase();
    const formatLabel: Record<string, string> = { PDF: 'HTML Report', CSV: 'CSV', EXCEL: 'TSV' };
    this.store.dispatch(ToastActions.showToast({
      message: `Generating "${report.name}" as ${formatLabel[format] || format}...`,
      toastType: 'info'
    }));

    this.premiumService.runReport(report.id).pipe(take(1)).subscribe({
      next: (result: any) => {
        this.runningReports.delete(report.id);
        this.store.dispatch(PremiumActions.loadReports()); // Refresh lastGeneratedAt

        if (result?.downloadUrl) {
          // Server returned a signed download URL
          this._triggerDownload(result.downloadUrl, `${report.name}.${this.getExtension(format)}`);
          this.store.dispatch(ToastActions.showToast({ message: 'Report downloaded successfully!', toastType: 'success' }));
        } else if (result?.data) {
          // Server returned inline data — generate client-side
          this._generateClientSideFile(report.name, format, result.data);
          this.store.dispatch(ToastActions.showToast({ message: 'Report generated and downloaded!', toastType: 'success' }));
        } else {
          // Fallback: generate a demo CSV from whatever the API returned
          this._generateClientSideFile(report.name, format, result);
          this.store.dispatch(ToastActions.showToast({ message: 'Report downloaded!', toastType: 'success' }));
        }
      },
      error: () => {
        this.runningReports.delete(report.id);
        this.store.dispatch(ToastActions.showToast({ message: 'Failed to generate report. Please try again.', toastType: 'error' }));
      }
    });
  }

  deleteReport(report: any) {
    this.selectedReport.set(report);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const report = this.selectedReport();
    if (!report) return;
    this.isSubmitting.set(true);
    this.store.dispatch(PremiumActions.deleteReport({ id: report.id }));
    setTimeout(() => {
      this.isConfirmDeleteOpen.set(false);
      this.isSubmitting.set(false);
      this.store.dispatch(ToastActions.showToast({ message: 'Report deleted successfully', toastType: 'success' }));
    }, 500);
  }

  // ── Private Helpers ─────────────────────────────────────────────────────────
  private _triggerDownload(url: string, filename: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private _generateClientSideFile(name: string, format: string, result: any) {
    // Unwrap API envelope: { reportName, reportType, range, generatedAt, summary, data }
    const rows: any[] = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];
    const summary: Record<string, any> = result?.summary ?? {};
    const generatedAt: string = result?.generatedAt
      ? new Date(result.generatedAt).toLocaleString()
      : new Date().toLocaleString();
    const reportType: string = result?.reportType ?? '';
    const range: string = result?.range ?? '';

    let content = '';
    let mimeType = 'text/plain';
    const ext = this.getExtension(format);

    if (format === 'CSV') {
      mimeType = 'text/csv';
      // Build summary block
      const summaryLines = Object.entries(summary).map(
        ([k, v]) => `"${k}","${String(v ?? '')}"`
      );
      // Build data table
      if (rows.length > 0) {
        const headers = Object.keys(rows[0])
          .map(h => `"${h}"`)
          .join(',');
        const dataRows = rows.map((r: any) =>
          Object.values(r)
            .map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`)
            .join(',')
        );
        content = [
          `"Report: ${name}"`,
          `"Generated: ${generatedAt}"`,
          `"Type: ${reportType}"`,
          `"Range: ${range}"`,
          '',
          '"--- Summary ---"',
          ...summaryLines,
          '',
          '"--- Data ---"',
          headers,
          ...dataRows,
        ].join('\n');
      } else {
        content = `"Report: ${name}"\n"Generated: ${generatedAt}"\n"No data available for this period."`;
      }

    } else if (format === 'EXCEL') {
      // TSV format for spreadsheet compatibility
      mimeType = 'text/tab-separated-values';
      const summaryLines = Object.entries(summary).map(
        ([k, v]) => `${k}\t${String(v ?? '')}`
      );
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]).join('\t');
        const tsvRows = rows.map((r: any) =>
          Object.values(r)
            .map((v: any) => String(v ?? '').replace(/\t/g, ' '))
            .join('\t')
        );
        content = [
          `Report: ${name}`,
          `Generated: ${generatedAt}`,
          `Type: ${reportType}\tRange: ${range}`,
          '',
          '--- Summary ---',
          ...summaryLines,
          '',
          '--- Data ---',
          headers,
          ...tsvRows,
        ].join('\n');
      } else {
        content = `Report: ${name}\nGenerated: ${generatedAt}\nNo data available.`;
      }

    } else {
      // HTML (PDF-printable)
      mimeType = 'text/html';
      const summaryHtml = Object.entries(summary)
        .map(([k, v]) =>
          `<tr><td style="padding:6px 12px;font-weight:600;color:#94a3b8;">${k}</td>
           <td style="padding:6px 12px;color:#f1f5f9;font-weight:700;">${String(v ?? '')}</td></tr>`
        ).join('');

      const tableHeaders = rows.length > 0
        ? Object.keys(rows[0]).map(k =>
            `<th style="padding:10px 14px;text-align:left;background:#1e293b;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #334155;">${k}</th>`
          ).join('')
        : '';

      const tableRows = rows.map((r: any, idx: number) =>
        `<tr style="background:${idx % 2 === 0 ? '#0f172a' : '#1e293b'}">
          ${Object.values(r).map((v: any) =>
            `<td style="padding:10px 14px;color:#e2e8f0;border-bottom:1px solid #1e293b;">${String(v ?? '')}</td>`
          ).join('')}
        </tr>`
      ).join('');

      content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0e1a; color: #e2e8f0; padding: 40px; }
    .header { background: linear-gradient(135deg, #1a1f3a 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 12px; padding: 32px; margin-bottom: 28px; }
    h1 { font-size: 28px; font-weight: 800; color: #f1f5f9; margin-bottom: 8px; }
    .meta { color: #64748b; font-size: 13px; margin-top: 8px; display: flex; gap: 24px; }
    .badge { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .summary-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; }
    .summary-label { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; }
    .summary-value { font-size: 22px; font-weight: 800; color: #f1f5f9; }
    table { width: 100%; border-collapse: collapse; background: #0f172a; border-radius: 10px; overflow: hidden; }
    @media print { body { background: #fff; color: #000; } .header { background: #f8fafc; border: 1px solid #e2e8f0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="meta">
      <span>Generated: ${generatedAt}</span>
      <span class="badge">${reportType}</span>
      <span class="badge">${range.replace(/_/g, ' ')}</span>
    </div>
  </div>

  ${summaryHtml ? `
  <div class="section">
    <div class="section-title">Executive Summary</div>
    <div class="summary-grid">
      ${Object.entries(summary).map(([k, v]) =>
        `<div class="summary-card"><div class="summary-label">${k}</div><div class="summary-value">${String(v ?? '')}</div></div>`
      ).join('')}
    </div>
  </div>` : ''}

  ${tableHeaders ? `
  <div class="section">
    <div class="section-title">Detailed Data (${rows.length} records)</div>
    <table>
      <thead><tr>${tableHeaders}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>` : '<p style="color:#64748b">No data available for this period.</p>'}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e293b;color:#475569;font-size:11px;">
    This report was generated by the Enterprise CRM Intelligence Platform. For questions, contact your system administrator.
  </div>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    this._triggerDownload(url, `${name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${ext}`);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  getExtension(format: string): string {
    switch (format.toUpperCase()) {
      case 'PDF':   return 'html';  // browser-printable HTML (print to PDF via browser)
      case 'EXCEL': return 'tsv';   // tab-separated for Excel import
      case 'CSV':   return 'csv';
      default:      return 'txt';
    }
  }

  // ── Template Helpers ─────────────────────────────────────────────────────────
  getTypeLabel(type: string): string {
    return REPORT_TYPE_META[type]?.label || type;
  }

  getTypeIcon(type: string): SafeHtml {
    const iconPath = REPORT_TYPE_META[type]?.icon || REPORT_TYPE_META['SALES'].icon;
    const iconSvg = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${iconPath}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
  }

  getTypeColorClass(type: string): string {
    const color = REPORT_TYPE_META[type]?.color || 'amber';
    const map: Record<string, string> = {
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return map[color] || map['amber'];
  }

  getFormatBadgeClass(format: string): string {
    switch (format) {
      case 'PDF': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXCEL': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CSV': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  }

  getRangeLabel(range: string): string {
    const labels: Record<string, string> = {
      LAST_7_DAYS: 'Last 7 Days',
      LAST_30_DAYS: 'Last 30 Days',
      LAST_90_DAYS: 'Last Quarter',
      LAST_365_DAYS: 'Last Year',
      ALL_TIME: 'All Time',
    };
    return labels[range] || range || 'Last 30 Days';
  }
}
