import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PremiumActions } from '../../../../core/state/premium/premium.actions';
import { selectPremiumRoles, selectPremiumLoading } from '../../../../core/state/premium/premium.selectors';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { PremiumService } from '../../../../core/services/premium.service';
import { take } from 'rxjs';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { ButtonComponent } from '../../../../core/components/button/button.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RequiresPremiumDirective, RouterLink, ReactiveFormsModule, HasPermissionDirective, ConfirmModalComponent, ButtonComponent],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Identity <span class="bg-gradient-premium bg-clip-text text-transparent italic">Manager</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Configure granular permissions and custom access levels for your organization.</p>
        </div>
        <app-button variant="premium" (clicked)="openCreateModal()" customClass="relative z-10 w-full sm:w-auto justify-center py-3 px-6">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Role
          </span>
        </app-button>
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (loading$ | async) {
          <div class="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse">Loading roles...</p>
          </div>
        } @else {
          @for (role of roles$ | async; track role.id) {
            <div class="glass-panel p-6 group hover:border-brand-primary/40 transition-all duration-300 flex flex-col h-full">
              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ role.name }}</h3>
                    <p class="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{{ role._count?.users || 0 }} Members Assigned</p>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="openAssignModal(role)" class="p-2 text-brand-secondary hover:text-emerald-400 transition-colors" title="Assign Role">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  </button>
                  <button (click)="editRole(role)" class="p-2 text-brand-secondary hover:text-white transition-colors" title="Edit Role">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button (click)="deleteRole(role)" class="p-2 text-brand-secondary hover:text-red-400 transition-colors" title="Delete Role">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <p class="text-xs text-brand-secondary line-clamp-2 mb-6 flex-grow">{{ role.description || 'No description provided' }}</p>
              
              <div class="space-y-4 pt-4 border-t border-white/5">
                <div class="flex flex-col gap-2">
                  <span class="text-[10px] text-brand-secondary/60 font-bold uppercase tracking-wider">Active Permissions</span>
                  <div class="flex flex-wrap gap-1">
                    @for (perm of role.permissions.slice(0, 4); track perm) {
                      <span class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-brand-secondary">{{ perm }}</span>
                    }
                    @if (role.permissions.length > 4) {
                      <span class="px-2 py-0.5 rounded bg-brand-primary/10 text-[9px] text-brand-primary">+{{ role.permissions.length - 4 }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 text-center glass-panel border-dashed border-2 border-white/5">
               <div class="flex flex-col items-center gap-3 opacity-50">
                <svg class="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v12m0 0h6a2 2 0 002-2v-3.5a1 1 0 00-1-1h-1m-6.12 4.12l-.5.5M7 7l.5.5" /></svg>
                <p class="text-brand-secondary italic text-sm">No custom roles defined yet.</p>
              </div>
            </div>
          }
        }
      </div>

      <!-- Create Role Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            <button (click)="closeModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h2 class="text-2xl font-bold mb-6">{{ editingRole() ? 'Edit' : 'Create' }} Custom Role</h2>

            <form [formGroup]="roleForm" (ngSubmit)="submitRole()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Role Name</label>
                  <input formControlName="name" type="text" placeholder="e.g., Senior Accountant" 
                  class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all outline-none ring-0 focus:ring-2 focus:ring-blue-500/30">
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
                  <textarea formControlName="description" rows="2" placeholder="Briefly describe this role's purpose..." 
                   class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all resize-none outline-none ring-0 focus:ring-2 focus:ring-blue-500/30"></textarea>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-3">Permissions</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    @for (perm of availablePermissions; track perm) {
                      <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group border border-transparent hover:border-white/5">
                        <input type="checkbox" [value]="perm" [checked]="selectedPermissions.has(perm)" (change)="togglePermission(perm)" 
                               class="w-4 h-4 rounded bg-black/40 border-white/10 text-brand-primary focus:ring-0 transition-all accent-brand-primary">
                        <span class="text-[11px] text-brand-secondary group-hover:text-white">{{ perm }}</span>
                      </label>
                    }
                  </div>
                </div>
              </div>

              <div class="pt-6 flex gap-3">
                <app-button type="button" variant="secondary" (clicked)="closeModal()" customClass="flex-1 py-3 justify-center">Cancel</app-button>
                <app-button type="submit" [disabled]="roleForm.invalid" variant="premium" customClass="flex-1 py-3 justify-center">
                  {{ editingRole() ? 'Update' : 'Create' }} Role
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Assign Role Modal -->
      @if (isAssignModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-sm p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <h2 class="text-xl font-bold mb-6">Assign <span class="text-brand-primary">{{ selectedRole()?.name }}</span></h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Select Team Member</label>
                <select #uidSelect 
                class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer">
                  <option value="">-- Choose User --</option>
                  @for (user of orgUsers(); track user.id) {
                    <option [value]="user.id">{{ user.firstName }} {{ user.lastName }} ({{ user.email }})</option>
                  }
                </select>
                @if (loadingUsers()) {
                  <p class="text-[10px] text-brand-primary mt-2 animate-pulse italic">Loading team members...</p>
                }
              </div>

              <div class="pt-6 flex gap-3">
                <button (click)="isAssignModalOpen.set(false)" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-all">Cancel</button>
                <button (click)="submitAssignment(uidSelect.value)" class="premium-button flex-1 py-2.5">Confirm Assignment</button>
              </div>
            </div>
          </div>
        </div>
      }

      @if (isConfirmDeleteOpen()) {
        <app-confirm-modal
          title="Delete Role"
          [message]="'Are you sure you want to delete the role ' + selectedRole()?.name + '? This action cannot be undone.'"
          confirmText="Delete Role"
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
export class RolesComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  private premiumService = inject(PremiumService);
  
  roles$ = this.store.select(selectPremiumRoles);
  loading$ = this.store.select(selectPremiumLoading);

  isModalOpen = signal(false);
  isAssignModalOpen = signal(false);
  isConfirmDeleteOpen = signal(false);
  selectedRole = signal<any>(null);
  editingRole = signal<any>(null);
  orgUsers = signal<any[]>([]);
  loadingUsers = signal(false);
  
  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    permissions: [[]]
  });

  availablePermissions = [
    'contacts:read', 'contacts:write', 'contacts:delete',
    'deals:read', 'deals:write', 'deals:delete',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'reports:read', 'reports:write', 'reports:delete',
    'workflows:read', 'workflows:write', 'workflows:delete',
    'roles:read', 'roles:write', 'roles:delete',
    'system:audit'
  ];

  selectedPermissions = new Set<string>();

  ngOnInit() {
    this.store.dispatch(PremiumActions.loadCustomRoles());
  }

  openCreateModal() {
    this.editingRole.set(null);
    this.roleForm.reset({ permissions: [] });
    this.selectedPermissions.clear();
    this.isModalOpen.set(true);
  }

  editRole(role: any) {
    this.editingRole.set(role);
    this.selectedPermissions = new Set(role.permissions);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingRole.set(null);
    this.roleForm.reset();
    this.selectedPermissions.clear();
  }

  deleteRole(role: any) {
    this.selectedRole.set(role);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const role = this.selectedRole();
    if (role) {
      this.store.dispatch(PremiumActions.deleteCustomRole({ id: role.id }));
      this.isConfirmDeleteOpen.set(false);
      this.store.dispatch(ToastActions.showToast({ message: 'Role deleted successfully', toastType: 'success' }));
    }
  }

  togglePermission(perm: string) {
    if (this.selectedPermissions.has(perm)) {
      this.selectedPermissions.delete(perm);
    } else {
      this.selectedPermissions.add(perm);
    }
    this.roleForm.patchValue({ permissions: Array.from(this.selectedPermissions) });
  }

  submitRole() {
    if (this.roleForm.valid) {
      if (this.editingRole()) {
        this.store.dispatch(PremiumActions.updateCustomRole({ 
          id: this.editingRole().id, 
          role: this.roleForm.value 
        }));
        this.store.dispatch(ToastActions.showToast({ message: 'Custom role updated successfully', toastType: 'success' }));
      } else {
        this.store.dispatch(PremiumActions.createCustomRole({ role: this.roleForm.value }));
        this.store.dispatch(ToastActions.showToast({ message: 'Custom role created successfully', toastType: 'success' }));
      }
      this.closeModal();
    }
  }

  openAssignModal(role: any) {
    this.selectedRole.set(role);
    this.isAssignModalOpen.set(true);
    
    // Fetch users if not already fetched
    if (this.orgUsers().length === 0) {
      this.loadingUsers.set(true);
      this.premiumService.getOrgUsers().pipe(take(1)).subscribe({
        next: (users: any[]) => {
          this.orgUsers.set(users);
          this.loadingUsers.set(false);
        },
        error: () => this.loadingUsers.set(false)
      });
    }
  }

  submitAssignment(userId: string) {
    if (!userId) return;
    this.store.dispatch(PremiumActions.assignRole({ 
      roleId: this.selectedRole().id, 
      userId 
    }));
    this.isAssignModalOpen.set(false);
    this.store.dispatch(ToastActions.showToast({ message: 'Role assignment successful', toastType: 'success' }));
  }
}
