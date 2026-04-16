import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectToasts } from '../../state/toast/toast.reducer';
import { ToastActions } from '../../state/toast/toast.actions';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-8 right-8 z-[100] flex flex-col gap-3 w-80">
      @for (toast of toasts$ | async; track toast.id) {
        <div 
          class="glass-panel p-4 flex items-center gap-4 animate-in slide-in-from-right-full duration-300 relative overflow-hidden group"
          [ngClass]="{
            'border-emerald-500/50': toast.toastType === 'success',
            'border-red-500/50': toast.toastType === 'error',
            'border-brand-primary/50': toast.toastType === 'info'
          }"
        >
          <!-- Accent Line -->
          <div class="absolute left-0 top-0 w-1 h-full"
            [ngClass]="{
              'bg-emerald-500': toast.toastType === 'success',
              'bg-red-500': toast.toastType === 'error',
              'bg-brand-primary': toast.toastType === 'info'
            }"
          ></div>

          <!-- Icon -->
          <div class="shrink-0">
            @if (toast.toastType === 'success') {
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            } @else if (toast.toastType === 'error') {
              <div class="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            } @else {
              <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            }
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium">{{ toast.message }}</p>
          </div>

          <!-- Close Button -->
          <button (click)="close(toast.id)" class="text-brand-secondary hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private store = inject(Store);
  toasts$ = this.store.select(selectToasts);

  close(id: string) {
    this.store.dispatch(ToastActions.hideToast({ id }));
  }
}
