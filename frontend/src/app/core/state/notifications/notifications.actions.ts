import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const NotificationActions = createActionGroup({
  source: 'Notifications',
  events: {
    'Add Notification': props<{ notification: any }>(),
    'Mark As Read': props<{ id: string }>(),
    'Clear All': emptyProps(),
  }
});
