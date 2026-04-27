import { createActionGroup, props } from '@ngrx/store';

export const ToastActions = createActionGroup({
  source: 'Toast',
  events: {
    'Show Toast': props<{ id?: string; message: string; toastType: 'success' | 'error' | 'info' | 'warning' }>(),
    'Hide Toast': props<{ id: string }>(),
  }
});
