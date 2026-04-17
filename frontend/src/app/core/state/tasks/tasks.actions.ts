import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': props<{ filters?: { assigneeId?: string; contactId?: string; dealId?: string } }>(),
    'Load Tasks Success': props<{ tasks: any[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),

    'Load Task': props<{ id: string }>(),
    'Load Task Success': props<{ task: any }>(),
    'Load Task Failure': props<{ error: string }>(),

    'Create Task': props<{ task: any }>(),
    'Create Task Success': props<{ task: any }>(),
    'Create Task Failure': props<{ error: string }>(),

    'Update Task': props<{ id: string; task: any }>(),
    'Update Task Success': props<{ task: any }>(),
    'Update Task Failure': props<{ error: string }>(),

    'Update Task Status': props<{ taskId: string, status: string }>(),
    'Update Task Status Success': props<{ task: any }>(),
    'Update Task Status Failure': props<{ error: string }>(),

    'Delete Task': props<{ id: string }>(),
    'Delete Task Success': props<{ id: string }>(),
    'Delete Task Failure': props<{ error: string }>(),

    'Export Tasks': props<{ filters?: { assigneeId?: string; contactId?: string; dealId?: string } }>(),
    'Export Tasks Success': emptyProps(),
    'Export Tasks Failure': props<{ error: string }>(),
  }
});
