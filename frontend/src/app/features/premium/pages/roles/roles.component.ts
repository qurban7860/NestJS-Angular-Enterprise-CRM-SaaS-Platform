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

@Component({
  selector: 'app-roles',
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
            <h1 class="text-3xl font-extrabold tracking-tight">Enterprise <span class="bg-gradient-premium bg-clip-text text-transparent italic">RBAC</span></h1>
          </div>
          <p class="text-brand-secondary mt-2 max-w-xl">Configure custom roles and granular permissions for your organization.</p>
        </div>
        
        <div class="flex items-center gap-3 relative z-10">
          <button *hasPermission="'roles:write'" (click)="openCreateModal()" class="premium-button">
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              Create Custom Role
            </span>
          </button>
        </div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 gap-6">
        @if (loading$ | async) {
          <div class="flex flex-col items-center justify-center py-20 gap-4">
            <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
            <p class="text-brand-secondary animate-pulse">Loading roles...</p>
          </div>
        } @else {
          <div class="glass-panel overflow-hidden border border-white/5">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-white/5 border-b border-brand-border">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-secondary/60">Role Name</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-secondary/60">Permissions</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-secondary/60">Users</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-widest text-brand-secondary/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                @for (role of roles$ | async; track role.id) {
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                        <span class="font-bold text-white">{{ role.name }}</span>
                      </div>
                      <p class="text-[11px] text-brand-secondary mt-1">{{ role.description || 'No description provided' }}</p>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-wrap gap-1">
                        @for (perm of role.permissions.slice(0, 3); track perm) {
                          <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-brand-secondary">{{ perm }}</span>
                        }
                        @if (role.permissions.length > 3) {
                          <span class="px-2 py-0.5 rounded-md bg-brand-primary/10 text-[10px] text-brand-primary">+{{ role.permissions.length - 3 }} more</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm text-brand-secondary">{{ role._count?.users || 0 }} Members</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="openAssignModal(role)" class="p-2 text-brand-secondary hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5" title="Assign to User">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        </button>
                        <button class="p-2 text-brand-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center gap-3 opacity-50">
                        <svg class="w-12 h-12 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3v12m0 0h6a2 2 0 002-2v-3.5a1 1 0 00-1-1h-1m-6.12 4.12l-.5.5M7 7l.5.5" /></svg>
                        <p class="text-brand-secondary italic text-sm">No custom roles defined yet.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Create Role Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div class="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Create Custom Role</h2>
              <button (click)="isModalOpen.set(false)" class="text-brand-secondary hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form [formGroup]="roleForm" (ngSubmit)="submitRole()" class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Role Name</label>
                <input formControlName="name" type="text" placeholder="e.g., Compliance Manager" 
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Description</label>
                <textarea formControlName="description" rows="3" placeholder="What can this role do?" 
                class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-primary/50 transition-all resize-none"></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Permissions</label>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  @for (perm of availablePermissions; track perm) {
                    <label class="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                      <input type="checkbox" [value]="perm" (change)="togglePermission(perm)" 
                             class="w-4 h-4 rounded bg-black/40 border-white/10 text-brand-primary focus:ring-0 transition-all accent-brand-primary">
                      <span class="text-[11px] text-brand-secondary group-hover:text-white">{{ perm }}</span>
                    </label>
                  }
                </div>
              </div>

              <div class="pt-6 flex gap-3">
                <button type="button" (click)="isModalOpen.set(false)" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-all">Cancel</button>
                <button type="submit" [disabled]="roleForm.invalid" class="premium-button flex-1 py-2.5">Create Role</button>
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
  selectedRole = signal<any>(null);
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
    this.isModalOpen.set(true);
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
      this.store.dispatch(PremiumActions.createCustomRole({ role: this.roleForm.value }));
      this.isModalOpen.set(false);
      this.roleForm.reset();
      this.selectedPermissions.clear();
      this.store.dispatch(ToastActions.showToast({ message: 'Custom role created successfully', toastType: 'success' }));
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
