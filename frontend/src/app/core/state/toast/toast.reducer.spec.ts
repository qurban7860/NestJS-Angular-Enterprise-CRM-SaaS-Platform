import { toastReducer, initialState } from './toast.reducer';
import { ToastActions } from './toast.actions';

describe('Toast Reducer', () => {
  it('should return the default state', () => {
    const action = { type: 'Unknown' } as any;
    const state = toastReducer(undefined, action);

    expect(state).toBe(initialState);
  });

  it('should add a toast on showToast', () => {
    const action = ToastActions.showToast({ 
      message: 'Test Message', 
      toastType: 'success' 
    });
    const state = toastReducer(initialState, action);

    expect(state.toasts.length).toBe(1);
    expect(state.toasts[0].message).toBe('Test Message');
    expect(state.toasts[0].toastType).toBe('success');
    expect(state.toasts[0].id).toBeDefined();
  });

  it('should remove a toast on hideToast', () => {
    const startState = {
      toasts: [{ id: '1', message: 'M1', toastType: 'info' as const }]
    };
    const action = ToastActions.hideToast({ id: '1' });
    const state = toastReducer(startState, action);

    expect(state.toasts.length).toBe(0);
  });
});
