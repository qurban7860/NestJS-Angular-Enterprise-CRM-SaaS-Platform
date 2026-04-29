import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { selectPremiumWorkflows, selectPremiumLoading } from '../../../../core/state/premium/premium.selectors';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { take } from 'rxjs';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../../../core/components/button/button.component';

@Component({
  selector: 'app-workflows',
  standalone: true,
  imports: [CommonModule, RequiresPremiumDirective, RouterLink, ReactiveFormsModule, HasPermissionDirective, ConfirmModalComponent, ButtonComponent],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Logic <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Automations</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Build and manage automated workflows to streamline your business processes and eliminate manual tasks.</p>
        </div>
        <app-button variant="premium" (clicked)="openCreateModal()" customClass="relative z-10 justify-center py-3 px-6">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Workflow
          </span>
        </app-button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @if (loading$ | async) {
          <div class="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse">Loading workflows...</p>
          </div>
        } @else {
          @for (wf of workflows$ | async; track wf.id) {
            <div class="glass-panel p-6 group hover:border-emerald-500/40 transition-all duration-300">
              <div class="flex justify-between items-start mb-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div class="flex items-center gap-2">
                  <span [ngClass]="wf.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-brand-secondary'" class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                    {{ wf.isActive ? 'Active' : 'Paused' }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button *hasPermission="'workflows:write'" (click)="toggleWorkflow(wf)" class="p-2 text-brand-secondary hover:text-white transition-colors" [title]="wf.isActive ? 'Pause Workflow' : 'Resume Workflow'">
                      @if (wf.isActive) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      }
                    </button>
                    <button *hasPermission="'workflows:delete'" (click)="deleteWorkflow(wf)" [disabled]="isSubmitting()" class="p-2 text-brand-secondary hover:text-red-400 transition-colors disabled:opacity-50" title="Delete Workflow">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              <h3 class="text-lg font-bold text-white mb-2">{{ wf.name }}</h3>
              <p class="text-xs text-brand-secondary line-clamp-2 mb-6">{{ wf.description }}</p>
              
              <div class="flex items-center justify-between py-4 border-t border-white/5">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-brand-secondary/60 font-bold uppercase">Trigger:</span>
                  <span class="text-xs text-emerald-400 font-medium">{{ wf.trigger }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-brand-secondary/60 font-bold uppercase">Actions:</span>
                  <span class="text-xs text-white font-medium">{{ wf.actions?.length || 0 }}</span>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 text-center glass-panel border-dashed border-2 border-white/5">
               <div class="flex flex-col items-center gap-3 opacity-50">
                <svg class="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <p class="text-brand-secondary italic text-sm">No automations created yet.</p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Create Workflow Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-emerald-500/20 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">New Automation Workflow</h2>

            <form [formGroup]="wfForm" (ngSubmit)="submitWorkflow()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Workflow Name</label>
                  <input formControlName="name" type="text" placeholder="e.g., Auto-assign High Value Leads" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all outline-none ring-0 focus:ring-2 focus:ring-emerald-500/30">
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Trigger Event</label>
                  <select formControlName="trigger" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer">
                    <option value="CONTACT_CREATED">When a new contact is created</option>
                    <option value="DEAL_STAGE_CHANGED">When a deal stage changes</option>
                    <option value="TASK_COMPLETED">When a task is completed</option>
                    <option value="VALUE_THRESHOLD_REACHED">When a deal value exceeds threshold</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
                  <textarea formControlName="description" rows="2" placeholder="Briefly describe what this workflow does..." 
                   class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all resize-none outline-none ring-0 focus:ring-2 focus:ring-emerald-500/30"></textarea>
                 </div>

                <!-- Actions Section -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Action Pipeline</label>
                    <button type="button" (click)="addAction()" class="text-[10px] text-emerald-400 hover:text-white font-bold uppercase tracking-wider transition-colors">+ Add Action</button>
                  </div>
                  
                  <div formArrayName="actions" class="space-y-3">
                    @for (action of actions.controls; track i; let i = $index) {
                      <div [formGroupName]="i" class="flex gap-3 items-start p-4 bg-white/5 rounded-xl border border-white/5 relative group/action">
                        <div class="flex-1 space-y-3">
                          <div>
                            <label class="block text-[9px] font-bold uppercase text-brand-secondary/60 mb-1">Type</label>
                            <select formControlName="type" class="w-full bg-[#0a0a0a] border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50 appearance-none">
                              <option value="CREATE_TASK">Create Task</option>
                              <option value="SEND_NOTIFICATION">Send Notification</option>
                              <option value="EXTERNAL_WEBHOOK">Webhook Call</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-[9px] font-bold uppercase text-brand-secondary/60 mb-1">Configuration (JSON)</label>
                            <input formControlName="configText" placeholder='{"key": "value"}' class="w-full bg-white/5 border border-brand-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500/50">
                          </div>
                        </div>
                        <button type="button" (click)="removeAction(i)" class="p-2 text-brand-secondary hover:text-red-400 transition-colors bg-white/5 rounded-lg border border-white/5 mt-5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    }
                  </div>
                </div>
               </div>

              <div class="pt-6 flex gap-3 border-t border-white/5">
                <app-button type="button" variant="secondary" (clicked)="isModalOpen.set(false)" [disabled]="isSubmitting()" customClass="flex-1 py-3 justify-center">Cancel</app-button>
                <app-button type="submit" [disabled]="wfForm.invalid || isSubmitting()" [loading]="isSubmitting()" variant="premium" customClass="!bg-emerald-500 !text-black !border-none flex-1 py-3 justify-center font-bold">
                   Create Workflow
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (isConfirmDeleteOpen()) {
        <app-confirm-modal
          title="Delete Workflow"
          [message]="'Are you sure you want to delete ' + selectedWorkflow()?.name + '? All automation logs for this workflow will be archived.'"
          confirmText="Delete Workflow"
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
export class WorkflowsComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  
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
    const actionGroup = this.fb.group({
      type: ['CREATE_TASK', Validators.required],
      configText: ['{}'],
      order: [this.actions.length]
    });
    this.actions.push(actionGroup);
  }

  removeAction(index: number) {
    this.actions.removeAt(index);
  }

  ngOnInit() {
    this.store.dispatch(PremiumActions.loadWorkflows());
  }

  openCreateModal() {
    this.isModalOpen.set(true);
  }

  toggleWorkflow(wf: any) {
    this.isSubmitting.set(true);
    // Note: If toggleWorkflow doesn't have an effect that turns off loading, 
    // ideally it should. For now, since NGRX effects handle it, we assume optimistically or let effect manage it.
    // However, to avoid sticking in loading, we can rely on a local timeout or subscription.
    // Assuming standard NGRX, we just dispatch.
    this.store.dispatch(PremiumActions.toggleWorkflow({ id: wf.id, isActive: !wf.isActive }));
    this.store.dispatch(ToastActions.showToast({ 
      message: `Workflow ${wf.isActive ? 'paused' : 'resumed'} successfully`, 
      toastType: 'success' 
    }));
    this.isSubmitting.set(false);
  }

  deleteWorkflow(wf: any) {
    this.selectedWorkflow.set(wf);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const wf = this.selectedWorkflow();
    if (wf) {
      this.isSubmitting.set(true);
      this.store.dispatch(PremiumActions.deleteWorkflow({ id: wf.id }));
      setTimeout(() => {
        this.isConfirmDeleteOpen.set(false);
        this.isSubmitting.set(false);
        this.store.dispatch(ToastActions.showToast({ message: 'Workflow deleted successfully', toastType: 'success' }));
      }, 500); // simulate short network delay for UI feedback
    }
  }

  submitWorkflow() {
    if (this.wfForm.valid) {
      const { name, trigger, description, isActive, actions } = this.wfForm.value;
      
      const mappedActions = actions.map((a: any) => ({
        type: a.type,
        order: a.order,
        config: JSON.parse(a.configText || '{}')
      }));

      this.isSubmitting.set(true);
      this.store.dispatch(PremiumActions.createWorkflow({ 
        workflow: { name, trigger, description, isActive, actions: mappedActions } 
      }));
      
      setTimeout(() => {
        this.isModalOpen.set(false);
        this.isSubmitting.set(false);
        this.wfForm.reset({ trigger: 'CONTACT_CREATED', isActive: true });
        this.actions.clear();
        this.store.dispatch(ToastActions.showToast({ message: 'Automation workflow created successfully', toastType: 'success' }));
      }, 500);
    }
  }
}
