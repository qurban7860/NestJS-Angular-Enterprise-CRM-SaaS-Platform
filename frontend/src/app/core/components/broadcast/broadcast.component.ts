
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroadcastingService, Broadcast } from '../../services/broadcasting.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-broadcast-overlay',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.7, 0, 0.84, 0)', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    @if (currentBroadcast()) {
      <div class="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none" @slideIn>
        <div [class]="containerClasses()" class="max-w-4xl w-full pointer-events-auto glass-panel border shadow-2xl p-4 sm:p-5 flex items-center gap-4 relative overflow-hidden group">
          <!-- Animated Background Glow -->
          <div [class]="glowClasses()" class="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
          
          <!-- Icon -->
          <div [class]="iconContainerClasses()" class="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            @switch (currentBroadcast()?.type) {
              @case ('URGENT') {
                <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              }
              @case ('WARNING') {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              }
              @case ('SUCCESS') {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              }
              @default {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              }
            }
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-extrabold uppercase tracking-widest mb-0.5" [class]="textAccentClasses()">
              {{ currentBroadcast()?.title }}
            </h3>
            <p class="text-white text-base font-medium leading-tight">
              {{ currentBroadcast()?.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3">
            <button (click)="dismiss()" class="p-2 text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    .glass-panel {
      background: rgba(15, 15, 20, 0.85);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
    }
  `]
})
export class BroadcastComponent {
  private readonly broadcastService = inject(BroadcastingService);

  currentBroadcast = computed(() => {
    const active = this.broadcastService.activeBroadcasts();
    return active.length > 0 ? active[0] : null;
  });

  containerClasses() {
    const type = this.currentBroadcast()?.type;
    switch (type) {
      case 'URGENT': return 'border-red-500/50 shadow-red-500/10';
      case 'WARNING': return 'border-amber-500/50 shadow-amber-500/10';
      case 'SUCCESS': return 'border-emerald-500/50 shadow-emerald-500/10';
      default: return 'border-blue-500/50 shadow-blue-500/10';
    }
  }

  glowClasses() {
    const type = this.currentBroadcast()?.type;
    switch (type) {
      case 'URGENT': return 'bg-red-500';
      case 'WARNING': return 'bg-amber-500';
      case 'SUCCESS': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  }

  iconContainerClasses() {
    const type = this.currentBroadcast()?.type;
    switch (type) {
      case 'URGENT': return 'bg-red-500/20 text-red-400';
      case 'WARNING': return 'bg-amber-500/20 text-amber-400';
      case 'SUCCESS': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  }

  textAccentClasses() {
    const type = this.currentBroadcast()?.type;
    switch (type) {
      case 'URGENT': return 'text-red-400';
      case 'WARNING': return 'text-amber-400';
      case 'SUCCESS': return 'text-emerald-400';
      default: return 'text-blue-400';
    }
  }

  dismiss() {
    const id = this.currentBroadcast()?.id;
    if (id) {
      this.broadcastService.dismiss(id);
    }
  }
}
