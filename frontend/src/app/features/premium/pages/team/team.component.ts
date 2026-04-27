import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PremiumService } from '../../../../core/services/premium.service';
import { ToastActions } from '../../../../core/state/toast/toast.actions';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { SubscriptionService } from '../../../../core/services/subscription.service';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">Team <span class="bg-gradient-premium bg-clip-text text-transparent italic">Management</span></h1>
          <p class="text-brand-secondary mt-2">Add and manage organization members, assign roles, and control access.</p>
        </div>
        <button (click)="openAddModal()" class="premium-button px-6 py-3 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add Member
        </button>
      </header>

      <div class="glass-panel overflow-hidden border border-white/5">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-brand-secondary">
              <th class="px-6 py-4">Member</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Joined</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            @for (member of members(); track member.id) {
              <tr class="hover:bg-white/[0.02] transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xs border border-brand-primary/20">
                      {{ member.firstName[0] }}{{ member.lastName[0] }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-white group-hover:text-brand-primary transition-colors">{{ member.firstName }} {{ member.lastName }}</p>
                      <p class="text-xs text-brand-secondary">{{ member.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">
                    {{ member.customRole?.name || member.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-brand-secondary">
                  {{ member.createdAt | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4">
                  <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" 
                        [class.text-emerald-400]="member.isActive" [class.text-red-400]="!member.isActive">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-400]="member.isActive" [class.bg-red-400]="!member.isActive"></span>
                    {{ member.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Add Member Modal -->
      @if (isModalOpen()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="glass-panel w-full max-w-md p-8 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <h2 class="text-xl font-bold mb-6">Add New Team Member</h2>
            <form [formGroup]="userForm" (ngSubmit)="submitUser()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">First Name</label>
                  <input formControlName="firstName" type="text" placeholder="John" class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2 text-sm focus:outline-none">
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Last Name</label>
                  <input formControlName="lastName" type="text" placeholder="Doe" class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2 text-sm focus:outline-none">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Email Address</label>
                <input formControlName="email" type="email" placeholder="[EMAIL_ADDRESS]" class="w-full bg-white/5 border border-brand-border rounded-xl px-4 py-2 text-sm focus:outline-none">
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1.5">Initial Role</label>
                <select formControlName="role" class="w-full bg-[#0a0a0a] border border-brand-border rounded-xl px-4 py-2 text-sm focus:outline-none">
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div class="pt-6 flex gap-3">
                <button type="button" (click)="isModalOpen.set(false)" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-sm">Cancel</button>
                <button type="submit" [disabled]="userForm.invalid" class="premium-button flex-1 py-2.5 font-bold">Add Member</button>
              </div>
            </form>
          </div>
        </div>
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
  isModalOpen = signal(false);
  
  userForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBER', Validators.required]
  });

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.premiumService.getOrgUsers().pipe(take(1)).subscribe(users => this.members.set(users));
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
      this.isModalOpen.set(true);
    });
  }

  submitUser() {
    if (this.userForm.valid) {
      // In a real app, we'd have a specific endpoint for this.
      // For now, I'll use the new auth/users POST endpoint I just added.
      this.premiumService.addTeamMember(this.userForm.value).pipe(take(1)).subscribe({
        next: () => {
          this.store.dispatch(ToastActions.showToast({ message: 'Team member added successfully!', toastType: 'success' }));
          this.isModalOpen.set(false);
          this.userForm.reset({ role: 'MEMBER' });
          this.loadMembers();
        },
        error: (err) => {
          this.store.dispatch(ToastActions.showToast({ message: err.error?.message || 'Failed to add member', toastType: 'error' }));
        }
      });
    }
  }
}
