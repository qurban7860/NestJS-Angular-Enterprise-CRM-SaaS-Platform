import { createFeature, createReducer, on } from '@ngrx/store';
import { NotificationActions } from './notifications.actions';

export interface NotificationsState {
  items: any[];
  unreadCount: number;
}

export const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
};

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer(
    initialState,
    on(NotificationActions.addNotification, (state, { notification }) => ({
      ...state,
      items: [notification, ...state.items],
      unreadCount: state.unreadCount + 1,
    })),
    on(NotificationActions.markAsRead, (state, { id }) => ({
      ...state,
      items: state.items.map(item => item.id === id ? { ...item, isRead: true } : item),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
    on(NotificationActions.clearAll, () => initialState),
  ),
});

export const {
  name: notificationsFeatureKey,
  reducer: notificationsReducer,
  selectItems,
  selectUnreadCount,
} = notificationsFeature;
