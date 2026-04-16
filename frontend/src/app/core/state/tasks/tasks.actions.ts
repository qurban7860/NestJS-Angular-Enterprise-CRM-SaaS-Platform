import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: any[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    'Create Task': props<{ task: any }>(),
    'Create Task Success': props<{ task: any }>(),
    'Create Task Failure': props<{ error: string }>(),

    'Update Task Status': props<{ taskId: string, status: string }>(),
    'Update Task Status Success': props<{ task: any }>(),
    'Update Task Status Failure': props<{ error: string }>(),
  }
});
