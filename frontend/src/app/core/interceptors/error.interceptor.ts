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
      const isLoginRequest = req.url.includes('/auth/login');

      if (error.status === 401) {
        // Unauthorized
        if (!isLoginRequest) {
          store.dispatch(ToastActions.showToast({ id: 'auth-err', message: 'Session expired. Please login again.', toastType: 'error' }));
        }
      } else if (error.status === 403) {
        // Forbidden - usually plan limit or permission issue
        store.dispatch(ToastActions.showToast({ 
          id: 'limit-err', 
          message: error.error?.error?.message || 'Action restricted by your current plan.', 
          toastType: 'info' 
        }));
      } else if (error.status === 0) {
        // Connection error
        store.dispatch(ToastActions.showToast({ id: 'net-err', message: 'Network error. Cannot reach server.', toastType: 'error' }));
      } else if (error.status >= 500) {
        store.dispatch(ToastActions.showToast({ id: 'server-err', message: 'Service temporarily unavailable. Please try again.', toastType: 'error' }));
      }

      return throwError(() => error);
    })
  );
};
