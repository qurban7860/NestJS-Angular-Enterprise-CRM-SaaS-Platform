import { createFeature, createReducer, on } from '@ngrx/store';
import { ToastActions } from './toast.actions';

export interface Toast {
  id: string;
  message: string;
  toastType: 'success' | 'error' | 'info';
}

export interface ToastState {
  toasts: Toast[];
}

export const initialState: ToastState = {
  toasts: [],
};

export const toastFeature = createFeature({
  name: 'toast',
  reducer: createReducer(
    initialState,
    on(ToastActions.showToast, (state, { id, message, toastType }) => {
      const toastId = id || Math.random().toString(36);
      return {
        ...state,
        toasts: [...state.toasts.filter(t => t.id !== toastId), { id: toastId, message, toastType }],
      };
    }),
    on(ToastActions.hideToast, (state, { id }) => ({
      ...state,
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  ),
});

export const {
  name: toastFeatureKey,
  reducer: toastReducer,
  selectToasts,
} = toastFeature;
