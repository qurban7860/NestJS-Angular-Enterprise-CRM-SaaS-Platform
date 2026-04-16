import { inject } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { SocketService } from '../../services/socket.service';
import { NotificationActions } from './notifications.actions';
import { map, tap } from 'rxjs';

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
