import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { selectPremiumWorkflows, selectPremiumLoading } from '../../../../core/state/premium/premium.selectors';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../../../core/components/button/button.component';

const TRIGGER_LABELS: Record<string, string> = {
  CONTACT_CREATED: 'New Contact Created',
  DEAL_STAGE_CHANGED: 'Deal Stage Changes',
  TASK_COMPLETED: 'Task Completed',
  VALUE_THRESHOLD_REACHED: 'Deal Value Exceeds Threshold',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_TASK: 'Create Task',
  SEND_NOTIFICATION: 'Send Notification',
  EXTERNAL_WEBHOOK: 'Webhook Call',
};

@Component({
  selector: 'app-workflows',
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
          <h1 class="text-3xl font-extrabold tracking-tight">Logic <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Automations</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl text-sm">Build and manage automated workflows to streamline your business processes and eliminate manual tasks.</p>
        </div>
        <app-button *hasPermission="'workflows:write'" variant="premium" (clicked)="openCreateModal()" customClass="relative z-10 justify-center py-3 px-6">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Workflow
          </span>
        </app-button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <!-- Stats Bar -->
      @if (workflows$ | async; as wfs) {
        @if (wfs.length > 0) {
          <div class="grid grid-cols-3 gap-4">
            <div class="glass-panel p-4 text-center">
              <p class="text-2xl font-black text-emerald-400">{{ wfs.length }}</p>
              <p class="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mt-1">Total</p>
            </div>
            <div class="glass-panel p-4 text-center">
              <p class="text-2xl font-black text-emerald-400">{{ getActiveCount(wfs) }}</p>
              <p class="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mt-1">Active</p>
            </div>
            <div class="glass-panel p-4 text-center">
              <p class="text-2xl font-black text-white">{{ getTotalActions(wfs) }}</p>
              <p class="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mt-1">Actions</p>
            </div>
          </div>
        }
      }

      <!-- Workflow Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @if (loading$ | async) {
          <div class="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse text-sm">Loading automations...</p>
          </div>
        } @else {
          @for (wf of workflows$ | async; track wf.id) {
            <div class="glass-panel p-6 group hover:border-emerald-500/40 transition-all duration-300 hover:shadow-emerald-500/5 hover:shadow-xl">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <span [class]="wf.isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-brand-secondary border border-white/10'"
                    class="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {{ wf.isActive ? 'Active' : 'Paused' }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <button *hasPermission="'workflows:write'" (click)="toggleWorkflow(wf)"
                    [disabled]="isSubmitting()"
                    [title]="wf.isActive ? 'Pause Workflow' : 'Resume Workflow'"
                    class="p-2 text-brand-secondary hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10 disabled:opacity-40">
                    @if (wf.isActive) {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    } @else {
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    }
                  </button>
                  <button *hasPermission="'workflows:delete'" (click)="deleteWorkflow(wf)"
                    [disabled]="isSubmitting()"
                    title="Delete Workflow"
                    class="p-2 text-brand-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 disabled:opacity-40">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <h3 class="text-base font-bold text-white mb-1">{{ wf.name }}</h3>
              <p class="text-xs text-brand-secondary line-clamp-2 mb-5 leading-relaxed">{{ wf.description || 'No description provided.' }}</p>

              <!-- Trigger / Actions Meta -->
              <div class="flex items-center justify-between py-3 border-t border-white/5">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-brand-secondary/60 font-bold uppercase">Trigger:</span>
                  <span class="text-xs text-emerald-400 font-semibold">{{ getTriggerLabel(wf.trigger) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-brand-secondary/60 font-bold uppercase">Actions:</span>
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">{{ wf.actions?.length || 0 }}</span>
                </div>
              </div>

              <!-- Action Pipeline Preview -->
              @if (wf.actions?.length > 0) {
                <div class="flex gap-2 flex-wrap mt-2">
                  @for (action of wf.actions; track action.id) {
                    <span class="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg font-medium text-brand-secondary">
                      {{ getActionLabel(action.type) }}
                    </span>
                  }
                </div>
              }
            </div>
          } @empty {
            <div class="col-span-full py-24 text-center glass-panel border-dashed border-2 border-white/5">
              <div class="flex flex-col items-center gap-4 opacity-40">
                <svg class="w-14 h-14 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <div>
                  <p class="text-base font-bold">No automations yet</p>
                  <p class="text-sm mt-1 text-brand-secondary">Create your first workflow to automate repetitive tasks.</p>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- ── Create Workflow Modal ── -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
          <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="mb-6">
            <h2 class="text-2xl font-bold">New Automation Workflow</h2>
            <p class="text-sm text-brand-secondary mt-1">Configure the trigger and actions for your automation.</p>
          </div>

          <form [formGroup]="wfForm" (ngSubmit)="submitWorkflow()" class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Workflow Name <span class="text-red-400">*</span></label>
              <input formControlName="name" type="text" placeholder="e.g., Auto-assign High Value Leads"
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all outline-none ring-0 focus:ring-2 focus:ring-emerald-500/30"
                [ngClass]="{'border-red-500/50': wfForm.get('name')?.invalid && wfForm.get('name')?.touched}">
              @if (wfForm.get('name')?.invalid && wfForm.get('name')?.touched) {
                <p class="text-red-400 text-xs mt-1">Name must be at least 3 characters.</p>
              }
            </div>

            <!-- Trigger -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Trigger Event <span class="text-red-400">*</span></label>
              <select formControlName="trigger" class="custom-select focus:ring-emerald-500/30 focus:border-emerald-500/50">
                <option value="CONTACT_CREATED">When a new contact is created</option>
                <option value="DEAL_STAGE_CHANGED">When a deal stage changes</option>
                <option value="TASK_COMPLETED">When a task is completed</option>
                <option value="VALUE_THRESHOLD_REACHED">When a deal value exceeds threshold</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
              <textarea formControlName="description" rows="2" placeholder="Briefly describe what this workflow does..."
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none outline-none ring-0 focus:ring-2 focus:ring-emerald-500/30"></textarea>
            </div>

            <!-- Actions Section -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Action Pipeline</label>
                <button type="button" (click)="addAction()"
                  class="text-[10px] text-emerald-400 hover:text-white font-bold uppercase tracking-wider transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-500/10">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                  Add Action
                </button>
              </div>

              @if (actions.length === 0) {
                <div class="border-2 border-dashed border-white/10 rounded-xl p-6 text-center">
                  <p class="text-xs text-brand-secondary">No actions yet. Click "Add Action" to build your pipeline.</p>
                </div>
              }

              <div formArrayName="actions" class="space-y-3">
                @for (action of actions.controls; track i; let i = $index) {
                  <div [formGroupName]="i" class="p-4 bg-white/[0.03] rounded-xl border border-white/8 relative group/action hover:border-emerald-500/20 transition-all">
                    <div class="flex items-center gap-2 mb-3">
                      <div class="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-[10px] font-black border border-emerald-500/20">{{ i + 1 }}</div>
                      <span class="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">Action {{ i + 1 }}</span>
                      <button type="button" (click)="removeAction(i)"
                        class="ml-auto p-1.5 text-brand-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5 hover:border-red-500/20">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                    <div class="space-y-3">
                      <div>
                        <label class="block text-[9px] font-bold uppercase text-brand-secondary/60 mb-1">Action Type</label>
                        <select formControlName="type" class="custom-select text-xs py-2 focus:ring-emerald-500/30 focus:border-emerald-500/50">
                          <option value="CREATE_TASK">Create Task</option>
                          <option value="SEND_NOTIFICATION">Send Notification</option>
                          <option value="EXTERNAL_WEBHOOK">Webhook Call</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-[9px] font-bold uppercase text-brand-secondary/60 mb-1">Configuration (JSON)</label>
                        <input formControlName="configText"
                          [placeholder]="getConfigPlaceholder(action.get('type')?.value)"
                          class="w-full bg-white/5 border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/50 font-mono"
                          [ngClass]="{'border-red-500/50': isInvalidJson(action.get('configText')?.value)}">
                        @if (isInvalidJson(action.get('configText')?.value)) {
                          <p class="text-red-400 text-[10px] mt-1">Invalid JSON format.</p>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Submit -->
            <div class="pt-5 flex gap-3 border-t border-white/5">
              <app-button type="button" variant="secondary" (clicked)="isModalOpen.set(false)" [disabled]="isSubmitting()" customClass="flex-1 py-3 justify-center">Cancel</app-button>
              <app-button type="submit"
                [disabled]="wfForm.invalid || isSubmitting() || hasJsonErrors()"
                [loading]="isSubmitting()"
                variant="premium"
                customClass="!bg-emerald-500 !text-black !border-none flex-1 py-3 justify-center font-bold">
                Create Workflow
              </app-button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Delete Modal -->
    @if (isConfirmDeleteOpen()) {
      <app-confirm-modal
        title="Delete Workflow"
        [message]="'Delete &quot;' + selectedWorkflow()?.name + '&quot;? All automation logs for this workflow will be archived and cannot be recovered.'"
        confirmText="Delete Workflow"
        [loading]="isSubmitting()"
        (confirm)="confirmDelete()"
        (cancel)="isConfirmDeleteOpen.set(false)">
      </app-confirm-modal>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class WorkflowsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  workflows$ = this.store.select(selectPremiumWorkflows);
  loading$ = this.store.select(selectPremiumLoading);

  isModalOpen = signal(false);
  isConfirmDeleteOpen = signal(false);
  isSubmitting = signal(false);
  selectedWorkflow = signal<any>(null);

  wfForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    trigger: ['CONTACT_CREATED', Validators.required],
    description: [''],
    isActive: [true],
    actions: this.fb.array([])
  });

  get actions() {
    return this.wfForm.get('actions') as FormArray;
  }

  addAction() {
    this.actions.push(this.fb.group({
      type: ['CREATE_TASK', Validators.required],
      configText: ['{}'],
      order: [this.actions.length]
    }));
  }

  removeAction(index: number) {
    this.actions.removeAt(index);
  }

  ngOnInit() {
    this.store.dispatch(PremiumActions.loadWorkflows());
  }

  openCreateModal() {
    this.wfForm.reset({ trigger: 'CONTACT_CREATED', isActive: true });
    this.actions.clear();
    this.addAction(); // Start with one action
    this.isModalOpen.set(true);
  }

  toggleWorkflow(wf: any) {
    this.isSubmitting.set(true);
    this.store.dispatch(PremiumActions.toggleWorkflow({ id: wf.id, isActive: !wf.isActive }));
    this.store.dispatch(ToastActions.showToast({
      message: `Workflow "${wf.name}" ${wf.isActive ? 'paused' : 'resumed'}`,
      toastType: 'success'
    }));
    setTimeout(() => this.isSubmitting.set(false), 400);
  }

  deleteWorkflow(wf: any) {
    this.selectedWorkflow.set(wf);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const wf = this.selectedWorkflow();
    if (!wf) return;
    this.isSubmitting.set(true);
    this.store.dispatch(PremiumActions.deleteWorkflow({ id: wf.id }));
    setTimeout(() => {
      this.isConfirmDeleteOpen.set(false);
      this.isSubmitting.set(false);
      this.store.dispatch(ToastActions.showToast({ message: 'Workflow deleted successfully', toastType: 'success' }));
    }, 500);
  }

  submitWorkflow() {
    if (this.wfForm.invalid || this.hasJsonErrors()) return;

    const { name, trigger, description, isActive, actions } = this.wfForm.value;
    const mappedActions = (actions as any[]).map((a, i) => ({
      type: a.type,
      order: i,
      config: this.safeParseJson(a.configText)
    }));

    this.isSubmitting.set(true);
    this.store.dispatch(PremiumActions.createWorkflow({
      workflow: { name, trigger, description, isActive, actions: mappedActions }
    }));

    setTimeout(() => {
      this.isModalOpen.set(false);
      this.isSubmitting.set(false);
      this.store.dispatch(ToastActions.showToast({ message: `Workflow "${name}" created successfully`, toastType: 'success' }));
    }, 600);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  getTriggerLabel(trigger: string): string {
    return TRIGGER_LABELS[trigger] || trigger;
  }

  getActionLabel(type: string): string {
    return ACTION_LABELS[type] || type;
  }

  getConfigPlaceholder(type: string): string {
    switch (type) {
      case 'CREATE_TASK': return '{"taskTitle": "Follow up with lead"}';
      case 'SEND_NOTIFICATION': return '{"message": "New lead assigned to you"}';
      case 'EXTERNAL_WEBHOOK': return '{"url": "https://hooks.example.com/notify"}';
      default: return '{"key": "value"}';
    }
  }

  isInvalidJson(value: string | null | undefined): boolean {
    if (!value || value.trim() === '') return false;
    try { JSON.parse(value); return false; } catch { return true; }
  }

  hasJsonErrors(): boolean {
    return this.actions.controls.some(c => this.isInvalidJson(c.get('configText')?.value));
  }

  safeParseJson(value: string): object {
    try { return JSON.parse(value || '{}'); } catch { return {}; }
  }

  getActiveCount(wfs: any[]): number {
    return wfs.filter(w => w.isActive).length;
  }

  getTotalActions(wfs: any[]): number {
    return wfs.reduce((acc, w) => acc + (w.actions?.length || 0), 0);
  }
}
