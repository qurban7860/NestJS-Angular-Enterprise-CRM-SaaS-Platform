import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BroadcastingService, Broadcast } from '../../../../core/services/broadcasting.service';
import { ButtonComponent } from '../../../../core/components/button/button.component';
import { RequiresPremiumDirective } from '../../../../core/directives/premium-gate.directive';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-broadcasting-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, RequiresPremiumDirective, HasPermissionDirective, ConfirmModalComponent, RouterLink],
  template: `
    <div class="space-y-8">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-8 glass-panel relative overflow-hidden gap-6">
        <div class="relative z-10">
          <h1 class="text-3xl font-extrabold tracking-tight">Signal <span class="bg-gradient-premium bg-clip-text text-transparent italic pr-2">Broadcaster</span></h1>
          <p class="text-brand-secondary mt-2 max-w-xl">Dispatch real-time announcements across the entire organization or system with zero latency.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 relative z-10">
          <ng-container *appRequiresPremium="'PREMIUM'; else upgradeBtn">
            <app-button *hasPermission="'broadcast:write'" variant="premium" (clicked)="isModalOpen.set(true)" customClass="justify-center py-3 px-6">
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                New Broadcast
              </span>
            </app-button>
          </ng-container>
          
          <ng-template #upgradeBtn>
             <app-button variant="secondary" routerLink="/billing/pricing" customClass="!border-indigo-500/30 text-indigo-400 py-3 px-6 justify-center">
               <span class="flex items-center gap-2">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
                 Unlock Transmission
               </span>
             </app-button>
          </ng-template>
        </div>
        
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-0"></div>
      </header>

      <div class="grid grid-cols-1 gap-6">
        <div class="glass-panel border border-brand-border rounded-2xl overflow-hidden">
          <div class="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 class="text-lg font-bold">Active Transmissions</h2>
            <span class="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/20">Live</span>
          </div>
          
          <div class="divide-y divide-white/5">
            @for (item of broadcasts(); track item.id) {
              <div class="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row justify-between gap-6 group">
                <div class="flex gap-4">
                  <div [class]="getTypeBadgeClasses(item.type)" class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span [class]="getTypeTextClasses(item.type)" class="text-[10px] font-extrabold uppercase tracking-widest">{{ item.type }}</span>
                      <span class="text-white/20">•</span>
                      <span class="text-xs text-brand-secondary">{{ item.createdAt | date:'MMM d, HH:mm' }}</span>
                    </div>
                    <h3 class="text-lg font-bold text-white">{{ item.title }}</h3>
                    <p class="text-brand-secondary text-sm max-w-2xl">{{ item.message }}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                   <app-button *hasPermission="'broadcast:write'" variant="secondary" [disabled]="isSubmitting()" [loading]="isSubmitting()" (clicked)="deactivate(item.id)" customClass="!text-red-400 !border-red-500/20 hover:!bg-red-500/10 px-4 py-2">
                      Kill Signal
                   </app-button>
                </div>
              </div>
            } @empty {
              <div class="p-20 text-center flex flex-col items-center gap-4 opacity-50">
                <svg class="w-16 h-16 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <p class="text-brand-secondary italic">No active signals being broadcasted.</p>
              </div>
            }
          </div>
        </div>
      </div>

    </div>

    <!-- Create Broadcast Modal (outside animate-in to fix fixed positioning) -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="glass-panel w-full max-w-lg p-8 shadow-2xl border border-indigo-500/30 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button (click)="isModalOpen.set(false)" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter italic">Initiate <span class="text-indigo-400">Transmission</span></h2>

          <form [formGroup]="broadcastForm" (ngSubmit)="submit()" class="space-y-6">
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-2">Subject Header</label>
                <input formControlName="title" type="text" placeholder="URGENT SYSTEM UPDATE" 
                class="input-field rounded-xl px-4 py-3 placeholder:opacity-30">
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-2">Target Audience</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" (click)="broadcastForm.patchValue({orgId: null})" 
                          [class]="!broadcastForm.get('orgId')?.value ? 'border-brand-primary bg-brand-primary/20 text-white' : 'border-white/5 bg-white/5 text-brand-secondary hover:bg-white/10'"
                          class="px-3 py-3 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    Global System
                  </button>
                  <button type="button" (click)="setOrgScope()" 
                          [class]="broadcastForm.get('orgId')?.value ? 'border-brand-primary bg-brand-primary/20 text-white' : 'border-white/5 bg-white/5 text-brand-secondary hover:bg-white/10'"
                          class="px-3 py-3 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></svg>
                    My Organization
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-2">Broadcast Message</label>
                <textarea formControlName="message" rows="4" placeholder="Transmit your message here..." 
                class="input-field px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none placeholder:opacity-30"></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary mb-2">Signal Type</label>
                <select formControlName="type" class="custom-select">
                  <option value="INFO">&#128161; Info — General announcement</option>
                  <option value="SUCCESS">&#9989; Success — Positive update</option>
                  <option value="WARNING">&#9888; Warning — Requires attention</option>
                  <option value="URGENT">&#128680; Urgent — Immediate action needed</option>
                </select>
              </div>

              <div class="flex items-center gap-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                 <svg class="w-5 h-5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <p class="text-[11px] text-indigo-300/70 font-medium">This message will be pushed instantly to all active user sessions globally.</p>
              </div>
            </div>

            <div class="pt-4 flex gap-3">
              <app-button type="button" variant="secondary" [disabled]="isSubmitting()" (clicked)="isModalOpen.set(false)" customClass="flex-1 py-3 justify-center">Abort</app-button>
              <app-button type="submit" [disabled]="broadcastForm.invalid || isSubmitting()" [loading]="isSubmitting()" variant="premium" customClass="flex-1 py-3 justify-center">Initiate Broadcast</app-button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Confirm Delete Modal (outside animate-in to fix fixed positioning) -->
    @if (isConfirmDeleteOpen()) {
      <app-confirm-modal
        title="Stop Broadcast"
        [message]="'Are you sure you want to stop this broadcast? It will be removed from all users screens immediately.'"
        confirmText="Stop Broadcast"
        [loading]="isSubmitting()"
        (confirm)="confirmDelete()"
        (cancel)="isConfirmDeleteOpen.set(false)"
      ></app-confirm-modal>
    }
  `,
  styles: [`
    :host { display: block; }
    .glass-panel {
      background: rgba(15, 15, 20, 0.4);
      backdrop-filter: blur(20px);
    }
  `]
})
export class BroadcastingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly broadcastService = inject(BroadcastingService);
  private readonly store = inject(Store);
  private readonly user$ = this.store.select(selectUser);
  private currentUser: any;

  broadcasts = this.broadcastService.activeBroadcasts;
  isModalOpen = signal(false);
  isSubmitting = signal(false);
  isConfirmDeleteOpen = signal(false);
  private selectedBroadcastId = signal<string | null>(null);

  broadcastForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    type: ['INFO', Validators.required],
    orgId: [null as string | null]
  });

  ngOnInit() {
    this.user$.subscribe((user: any) => this.currentUser = user);
  }

  setOrgScope() {
    if (this.currentUser?.orgId) {
      this.broadcastForm.patchValue({ orgId: this.currentUser.orgId });
    }
  }



  getTypeBadgeClasses(type: string) {
    switch (type) {
      case 'URGENT': return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/10';
      case 'WARNING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10';
      case 'SUCCESS': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10';
      default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10';
    }
  }

  getTypeTextClasses(type: string) {
    switch (type) {
      case 'URGENT': return 'text-red-400';
      case 'WARNING': return 'text-amber-400';
      case 'SUCCESS': return 'text-emerald-400';
      default: return 'text-indigo-400';
    }
  }

  submit() {
    if (this.broadcastForm.invalid) return;

    this.isSubmitting.set(true);
    this.broadcastService.sendBroadcast(this.broadcastForm.value).subscribe({
      next: () => {
        setTimeout(() => {
          this.isModalOpen.set(false);
          this.isSubmitting.set(false);
          this.broadcastForm.reset({ type: 'INFO', orgId: null });
        }, 500);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  deactivate(id: string) {
    this.selectedBroadcastId.set(id);
    this.isConfirmDeleteOpen.set(true);
  }

  confirmDelete() {
    const id = this.selectedBroadcastId();
    if (!id) return;
    this.isSubmitting.set(true);
    this.broadcastService.deactivateBroadcast(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.broadcastService.dismiss(id);
          this.broadcasts.set(this.broadcastService.activeBroadcasts());
          this.isSubmitting.set(false);
          this.isConfirmDeleteOpen.set(false);
          this.selectedBroadcastId.set(null);
        }, 500);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.isConfirmDeleteOpen.set(false);
      }
    });
  }
}
