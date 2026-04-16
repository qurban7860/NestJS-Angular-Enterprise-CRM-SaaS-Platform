import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

export const loginEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        authService.login(credentials).pipe(
          map((response) => AuthActions.loginSuccess(response)),
          catchError((error) => of(AuthActions.loginFailure({ error: error.error?.message || 'Login failed' })))
        )
      )
    );
  },
  { functional: true }
);

export const registerEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ data }) =>
        authService.register(data).pipe(
          map((response) => AuthActions.registerSuccess(response)),
          catchError((error) => of(AuthActions.registerFailure({ error: error.error?.message || 'Registration failed' })))
        )
      )
    );
  },
  { functional: true }
);

export const loginSuccessEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ accessToken }) => {
        localStorage.setItem('access_token', accessToken);
        router.navigate(['/dashboard']);
      })
    );
  },
  { functional: true, dispatch: false }
);

export const registerSuccessEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(() => {
        // Industry standard: redirect to login to force manual authentication
        localStorage.removeItem('access_token');
        router.navigate(['/auth/login']);
      })
    );
  },
  { functional: true, dispatch: false }
);

export const logoutEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('access_token');
        router.navigate(['/auth/login']);
      })
    );
  },
  { functional: true, dispatch: false }
);

export const loadProfileEffect = createEffect(
  (actions$ = inject(Actions), authService = inject(AuthService)) => {
    return actions$.pipe(
      ofType(AuthActions.loadProfile),
      mergeMap(() =>
        authService.getProfile().pipe(
          map((user) => AuthActions.loadProfileSuccess({ user })),
          catchError(() => of(AuthActions.loadProfileFailure()))
        )
      )
    );
  },
  { functional: true }
);
