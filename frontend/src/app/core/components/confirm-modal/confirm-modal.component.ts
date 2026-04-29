import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- z-[200] sits above create/update modals (z-[100]) and the top-nav, ensuring blur covers everything -->
    <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[200] flex items-center justify-center animate-in fade-in duration-200 p-4">
      <div class="glass-panel w-full max-w-md p-6 relative shadow-2xl border border-white/10 rounded-2xl animate-in zoom-in-95 duration-200">
        <button (click)="onCancel()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="mb-6 flex items-start gap-4">
          <div class="w-12 h-12 flex-shrink-0 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0 pt-1">
            <h2 class="text-lg font-bold text-white">{{ title }}</h2>
            <p class="text-sm text-brand-secondary mt-1.5 leading-relaxed">{{ message }}</p>
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row gap-3">
          <button [disabled]="loading" (click)="onCancel()"
            class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium whitespace-nowrap disabled:opacity-50">
            {{ cancelText }}
          </button>
          <button [disabled]="loading" (click)="onConfirm()"
            class="relative flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all text-sm font-bold shadow-lg shadow-red-600/25 whitespace-nowrap disabled:opacity-60">
            <span class="flex items-center justify-center gap-2" [class.opacity-0]="loading">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              {{ confirmText }}
            </span>
            <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmModalComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
