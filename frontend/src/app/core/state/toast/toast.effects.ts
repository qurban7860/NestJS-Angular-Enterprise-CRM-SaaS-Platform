import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ToastActions } from './toast.actions';
import { delay, map, mergeMap, of } from 'rxjs';
import { AuthActions } from '../auth/auth.actions';

export const autoHideToastEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(ToastActions.showToast),
      mergeMap(({ id }) => {
        // Use a persistent ID for the timer even if none came from the action
        const finalId = id || Math.random().toString(36);
        return of(ToastActions.hideToast({ id: finalId })).pipe(delay(4000));
      })
    );
  },
  { functional: true }
);

export const authErrorEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(AuthActions.loginFailure, AuthActions.registerFailure),
      map(({ error }) => ToastActions.showToast({ message: error, toastType: 'error' }))
    );
  },
  { functional: true }
);
