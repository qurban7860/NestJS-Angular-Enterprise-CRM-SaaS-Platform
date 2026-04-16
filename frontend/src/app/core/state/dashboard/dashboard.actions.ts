import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DashboardStats } from '../../services/dashboard.service';

export const DashboardActions = createActionGroup({
  source: 'Dashboard',
  events: {
    'Load Stats': emptyProps(),
    'Load Stats Success': props<{ stats: DashboardStats }>(),
    'Load Stats Failure': props<{ error: string }>(),
  }
});
