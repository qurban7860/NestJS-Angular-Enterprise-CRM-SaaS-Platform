import { ApplicationConfig, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideStore, Store } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import * as authEffects from './core/state/auth/auth.effects';
import * as notificationEffects from './core/state/notifications/notifications.effects';
import * as toastEffects from './core/state/toast/toast.effects';
import { CRMEffects } from './core/state/crm/crm.effects';
import { TasksEffects } from './core/state/tasks/tasks.effects';
import { DashboardEffects } from './core/state/dashboard/dashboard.effects';

import { authReducer, authFeatureKey } from './core/state/auth/auth.reducer';
import { notificationsReducer, notificationsFeatureKey } from './core/state/notifications/notifications.reducer';
import { toastReducer, toastFeatureKey } from './core/state/toast/toast.reducer';
import { reducer as crmReducer, name as crmFeatureKey } from './core/state/crm/crm.reducer';
import { tasksReducer, tasksFeatureKey } from './core/state/tasks/tasks.reducer';
import { dashboardReducer, dashboardFeatureKey } from './core/state/dashboard/dashboard.reducer';

import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthActions } from './core/state/auth/auth.actions';

export function initializeApp(store: Store) {
  return () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      store.dispatch(AuthActions.loadProfile());
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    
    // NgRx Configuration
    provideStore({
      [authFeatureKey]: authReducer,
      [notificationsFeatureKey]: notificationsReducer,
      [toastFeatureKey]: toastReducer,
      [crmFeatureKey]: crmReducer,
      [tasksFeatureKey]: tasksReducer,
      [dashboardFeatureKey]: dashboardReducer
    }),
    provideEffects([authEffects, notificationEffects, toastEffects, CRMEffects, TasksEffects, DashboardEffects]),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
      connectInZone: true
    }),

    // Initialize Auth Session
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [Store]
    }
  ]
};
