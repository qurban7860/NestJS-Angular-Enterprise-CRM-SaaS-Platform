import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { ToastActions } from '../state/toast/toast.actions';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        errorMessage = error.error?.error?.message || error.message || errorMessage;
      }

      // Handle specific status codes
      if (error.status === 401) {
        // Unauthorized - session likely expired
        store.dispatch(ToastActions.showToast({ id: 'auth-err', message: 'Session expired. Please login again.', toastType: 'error' }));
      } else if (error.status === 0) {
        // Connection error
        store.dispatch(ToastActions.showToast({ id: 'net-err', message: 'Network error. Cannot reach server.', toastType: 'error' }));
      } else if (error.status >= 500) {
        store.dispatch(ToastActions.showToast({ id: 'server-err', message: 'Internal server error. Please try later.', toastType: 'error' }));
      }

      return throwError(() => error);
    })
  );
};
