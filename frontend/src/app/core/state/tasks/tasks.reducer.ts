import { createFeature, createReducer, on } from '@ngrx/store';
import { TasksActions } from './tasks.actions';

export interface TasksState {
  tasks: any[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
};

export const tasksFeature = createFeature({
  name: 'tasks',
  reducer: createReducer(
    initialState,
    on(TasksActions.loadTasks, (state) => ({ ...state, isLoading: true, error: null })),
    on(TasksActions.loadTasksSuccess, (state, { tasks }) => ({ ...state, isLoading: false, tasks })),
    on(TasksActions.loadTasksFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.createTask, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.createTaskSuccess, (state, { task }) => ({ 
      ...state, 
      isLoading: false, 
      tasks: [task, ...state.tasks] 
    })),
    on(TasksActions.createTaskFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.updateTaskStatusSuccess, (state, { task }) => ({
      ...state,
      tasks: state.tasks.map(t => t.id === task.id ? task : t)
    }))
  ),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasks,
  selectIsLoading,
  selectError,
} = tasksFeature;
