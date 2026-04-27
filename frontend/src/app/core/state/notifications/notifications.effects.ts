import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NotificationsService } from '../../services/notifications.service';
import { SocketService } from '../../services/socket.service';
import { NotificationActions } from './notifications.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

export const loadNotifications$ = createEffect(
  (actions$ = inject(Actions), notificationsService = inject(NotificationsService)) => {
    return actions$.pipe(
      ofType(NotificationActions.loadNotifications),
      mergeMap(() => notificationsService.getNotifications().pipe(
        map(notifications => NotificationActions.loadNotificationsSuccess({ notifications })),
        catchError(error => of(NotificationActions.loadNotificationsFailure({ error: error.message })))
      ))
    );
  },
  { functional: true }
);

export const markAsRead$ = createEffect(
  (actions$ = inject(Actions), notificationsService = inject(NotificationsService)) => {
    return actions$.pipe(
      ofType(NotificationActions.markAsRead),
      mergeMap(({ id }) => notificationsService.markAsRead(id).pipe(
        map(() => ({ type: '[Notifications] Mark As Read Success' })),
        catchError(() => of({ type: '[Notifications] Mark As Read Error' }))
      ))
    );
  },
  { functional: true, dispatch: false }
);

export const listenToNotificationsEffect = createEffect(
  (socketService = inject(SocketService)) => {
    return socketService.notifications$.pipe(
      map(notification => NotificationActions.addNotification({ notification }))
    );
  },
  { functional: true }
);

export const logNotificationEffect = createEffect(
  () => {
    return inject(SocketService).notifications$.pipe(
      tap(n => console.log('Real-time notification received:', n))
    );
  },
  { functional: true, dispatch: false }
);
