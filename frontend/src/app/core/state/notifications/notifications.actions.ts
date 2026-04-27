import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const NotificationActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Load Notifications': emptyProps(),
    'Load Notifications Success': props<{ notifications: any[] }>(),
    'Load Notifications Failure': props<{ error: string }>(),
    'Add Notification': props<{ notification: any }>(),
    'Mark As Read': props<{ id: string }>(),
    'Clear All': emptyProps(),
    'Toggle Dropdown': props<{ isOpen?: boolean }>(),
  }
});
