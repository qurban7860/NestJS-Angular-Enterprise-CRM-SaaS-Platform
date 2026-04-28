import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PremiumService } from '../../../../core/services/premium.service';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { Store } from '@ngrx/store';
import { take, forkJoin } from 'rxjs';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../../../core/components/button/button.component';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ConfirmModalComponent, ButtonComponent, HasPermissionDirective],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Team <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Management</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Scale your organization by adding team members, assigning custom roles, and managing permissions.</p>
        </div>
        <app-button variant="premium" (clicked)="openAddModal()" customClass="z-10 w-full sm:w-auto justify-center">
          <span class="flex items-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            <span class="line-clamp-1 ml-1 md:block hidden">Add Member</span>
          </span>
        </app-button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (member of members(); track member.id) {
          <div class="glass-panel p-6 group hover:border-brand-primary/40 transition-all duration-300 flex flex-col h-full border border-white/5">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-premium flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/10">
                  {{ member.firstName[0] }}{{ member.lastName[0] }}
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white group-hover:text-brand-primary transition-colors">{{ member.firstName }} {{ member.lastName }}</h3>
                  <p class="text-xs text-brand-secondary">{{ member.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="editMember(member)" class="p-2 text-brand-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Edit Member">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button (click)="deleteMember(member)" class="p-2 text-brand-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-white/5" title="Remove Member">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-4 border-t border-white/5 flex-grow">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-brand-secondary/60 font-bold uppercase tracking-wider">Access Role</span>
                <span class="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-[10px] text-brand-primary font-bold">
                  {{ member.customRole?.name || member.role }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-brand-secondary/60 font-bold uppercase tracking-wider">Status</span>
                <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" 
                      [class.text-emerald-400]="member.isActive" [class.text-red-400]="!member.isActive">
                  <span class="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                        [class.bg-emerald-400]="member.isActive" [class.bg-red-400]="!member.isActive"></span>
                  {{ member.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            
            <div class="mt-6 flex gap-2">
               <app-button variant="ghost" customClass="w-full text-[11px] font-bold uppercase tracking-wider py-2" (clicked)="toggleStatus(member)">
                 {{ member.isActive ? 'Deactivate' : 'Activate' }}
               </app-button>
            </div>
          </div>
        } @empty {
          <div class="col-span-full py-20 text-center glass-panel border-dashed border-2 border-white/5">
             <div class="flex flex-col items-center gap-3 opacity-50">
              <svg class="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <p class="text-brand-secondary italic text-sm">No team members found.</p>
            </div>
          </div>
        }
      </div>

      <!-- Member Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">{{ editingMember() ? 'Edit Team Member' : 'Add New Member' }}</h2>
            
            <form [formGroup]="userForm" (ngSubmit)="submitUser()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">First Name</label>
                  <input formControlName="firstName" type="text" placeholder="John" 
                         class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all">
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Last Name</label>
                  <input formControlName="lastName" type="text" placeholder="Doe" 
                         class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all">
                </div>
              </div>
              
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Email Address</label>
                <input formControlName="email" type="email" placeholder="john@example.com" [readonly]="!!editingMember()"
                       class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all"
                       [class.opacity-50]="editingMember()">
              </div>
              
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Base Role</label>
                <select formControlName="role" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer">
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Custom Role (Optional)</label>
                <select formControlName="customRoleId" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer">
                  <option [value]="null">No Custom Role</option>
                  @for (role of customRoles(); track role.id) {
                    <option [value]="role.id">{{ role.name }}</option>
                  }
                </select>
              </div>

              <div class="pt-6 flex gap-3">
                <app-button type="button" variant="secondary" (clicked)="isModalOpen.set(false)" customClass="flex-1 py-3 justify-center">Cancel</app-button>
                <app-button type="submit" [disabled]="userForm.invalid" variant="premium" customClass="flex-1 py-3 justify-center">
                  {{ editingMember() ? 'Update' : 'Add' }} Member
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (isConfirmDeleteOpen()) {
        <app-confirm-modal
          title="Remove Member"
          [message]="'Are you sure you want to remove ' + selectedMember()?.firstName + ' ' + selectedMember()?.lastName + ' from the organization? This will revoke all access immediately.'"
          confirmText="Remove Member"
          (confirm)="confirmDelete()"
          (cancel)="isConfirmDeleteOpen.set(false)"
        ></app-confirm-modal>
      }
    </div>
  `
})
export class TeamManagementComponent implements OnInit {
  private premiumService = inject(PremiumService);
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);

  members = signal<any[]>([]);
  customRoles = signal<any[]>([]);
  isModalOpen = signal(false);
  isConfirmDeleteOpen = signal(false);
  selectedMember = signal<any>(null);
  editingMember = signal<any>(null);
  
  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBER', Validators.required],
    customRoleId: [null],
    isActive: [true]
  });

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    forkJoin({
      members: this.premiumService.getOrgUsers(),
      roles: this.premiumService.getCustomRoles()
    }).pipe(take(1)).subscribe({
      next: (data) => {
        this.members.set(data.members);
        this.customRoles.set(data.roles);
      }
    });
  }

  openAddModal() {
    this.subService.limits$.pipe(take(1)).subscribe((limits: any) => {
      if (this.members().length >= limits.maxUsers) {
        this.store.dispatch(ToastActions.showToast({ 
          message: `User limit reached (${limits.maxUsers}). Please upgrade your plan to add more team members.`, 
          toastType: 'warning' 
        }));
        return;
      }
      this.editingMember.set(null);
      this.userForm.reset({ role: 'MEMBER', isActive: true, customRoleId: null });
      this.isModalOpen.set(true);
    });
  }

  editMember(member: any) {
    this.editingMember.set(member);
    this.userForm.patchValue({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      customRoleId: member.customRoleId,
      isActive: member.isActive
    });
    this.isModalOpen.set(true);
  }

  deleteMember(member: any) {
    this.selectedMember.set(member);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const member = this.selectedMember();
    if (member) {
      this.premiumService.removeTeamMember(member.id).pipe(take(1)).subscribe({
        next: () => {
          this.store.dispatch(ToastActions.showToast({ message: 'Team member removed', toastType: 'success' }));
          this.isConfirmDeleteOpen.set(false);
          this.refreshData();
        },
        error: (err) => {
          this.store.dispatch(ToastActions.showToast({ message: err.error?.message || 'Failed to remove member', toastType: 'error' }));
        }
      });
    }
  }

  toggleStatus(member: any) {
    this.premiumService.updateTeamMember(member.id, { isActive: !member.isActive }).pipe(take(1)).subscribe({
      next: () => {
        this.store.dispatch(ToastActions.showToast({ 
          message: `Member ${member.isActive ? 'deactivated' : 'activated'}`, 
          toastType: 'success' 
        }));
        this.refreshData();
      }
    });
  }

  submitUser() {
    if (this.userForm.valid) {
      const data = this.userForm.value;
      const obs = this.editingMember() 
        ? this.premiumService.updateTeamMember(this.editingMember().id, data)
        : this.premiumService.addTeamMember(data);

      obs.pipe(take(1)).subscribe({
        next: () => {
          this.store.dispatch(ToastActions.showToast({ 
            message: `Team member ${this.editingMember() ? 'updated' : 'added'} successfully!`, 
            toastType: 'success' 
          }));
          this.isModalOpen.set(false);
          this.refreshData();
        },
        error: (err) => {
          this.store.dispatch(ToastActions.showToast({ message: err.error?.message || 'Operation failed', toastType: 'error' }));
        }
      });
    }
  }
}
