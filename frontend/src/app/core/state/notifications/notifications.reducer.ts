import { createFeature, createReducer, on } from '@ngrx/store';
import { NotificationActions } from './notifications.actions';

export interface NotificationsState {
  items: any[];
  unreadCount: number;
  isLoading: boolean;
  isDropdownOpen: boolean;
}

export const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  isDropdownOpen: false,
};

export const notificationsFeature = createFeature({
  name: 'notifications',
  reducer: createReducer(
    initialState,
    on(NotificationActions.loadNotifications, (state) => ({
      ...state,
      isLoading: true
    })),
    on(NotificationActions.loadNotificationsSuccess, (state, { notifications }) => ({
      ...state,
      items: notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
      isLoading: false
    })),
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
    on(NotificationActions.toggleDropdown, (state, { isOpen }) => ({
      ...state,
      isDropdownOpen: isOpen ?? !state.isDropdownOpen
    })),
    on(NotificationActions.clearAll, () => initialState),
  ),
});

export const {
  name: notificationsFeatureKey,
  reducer: notificationsReducer,
  selectItems,
  selectUnreadCount,
  selectIsLoading,
  selectIsDropdownOpen,
} = notificationsFeature;
