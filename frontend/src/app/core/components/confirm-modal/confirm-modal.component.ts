import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in zoom-in duration-200 p-4">
      <div class="glass-panel w-full max-w-md p-6 relative shadow-2xl border border-white/10 rounded-2xl">
        <button (click)="onCancel()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <div class="mb-6 flex items-center gap-4">
          <div class="w-12 h-12 flex-shrink-0 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">{{ title }}</h2>
            <p class="text-sm text-brand-secondary mt-1">{{ message }}</p>
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row gap-3 mt-8">
          <button [disabled]="loading" (click)="onCancel()" class="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium whitespace-nowrap">
            {{ cancelText }}
          </button>
          <button [disabled]="loading" (click)="onConfirm()" class="relative flex-1 px-4 py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 text-white transition-all text-sm font-bold shadow-lg shadow-red-500/20 whitespace-nowrap">
            <span class="flex items-center justify-center gap-2" [class.opacity-0]="loading">
              {{ confirmText }}
            </span>
            <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
              <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
