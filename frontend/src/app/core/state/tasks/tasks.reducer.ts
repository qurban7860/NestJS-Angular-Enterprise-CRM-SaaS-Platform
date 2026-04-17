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

    on(TasksActions.loadTask, (state) => ({ ...state, isLoading: true, error: null })),
    on(TasksActions.loadTaskSuccess, (state, { task }) => {
      const exists = state.tasks.find(t => t.id === task.id);
      return {
        ...state,
        isLoading: false,
        tasks: exists ? state.tasks.map(t => t.id === task.id ? task : t) : [...state.tasks, task]
      };
    }),
    on(TasksActions.loadTaskFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.createTask, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.createTaskSuccess, (state, { task }) => ({ 
      ...state, 
      isLoading: false, 
      tasks: [task, ...state.tasks] 
    })),
    on(TasksActions.createTaskFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.updateTask, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.updateTaskSuccess, (state, { task }) => ({
      ...state,
      isLoading: false,
      tasks: state.tasks.map(t => t.id === task.id ? task : t)
    })),
    on(TasksActions.updateTaskFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.updateTaskStatus, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.updateTaskStatusSuccess, (state, { task }) => ({
      ...state,
      isLoading: false,
      tasks: state.tasks.map(t => t.id === task.id ? task : t)
    })),
    on(TasksActions.updateTaskStatusFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.deleteTask, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
      ...state,
      isLoading: false,
      tasks: state.tasks.filter(t => t.id !== id)
    })),
    on(TasksActions.deleteTaskFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(TasksActions.exportTasks, (state) => ({ ...state, isLoading: true })),
    on(TasksActions.exportTasksSuccess, (state) => ({ ...state, isLoading: false })),
    on(TasksActions.exportTasksFailure, (state, { error }) => ({ ...state, isLoading: false, error }))
  ),
});

export const {
  name: tasksFeatureKey,
  reducer: tasksReducer,
  selectTasks,
  selectIsLoading,
  selectError,
} = tasksFeature;
