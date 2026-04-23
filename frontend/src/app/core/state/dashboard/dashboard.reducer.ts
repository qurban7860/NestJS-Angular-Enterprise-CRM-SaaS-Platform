import { createFeature, createReducer, on } from '@ngrx/store';
import { DashboardActions } from './dashboard.actions';
import { DashboardStats } from '../../services/dashboard.service';
import { CRMActions } from '../crm/crm.actions';
import { TasksActions } from '../tasks/tasks.actions';

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
};

export const dashboardFeature = createFeature({
  name: 'dashboard',
  reducer: createReducer(
    initialState,
    on(DashboardActions.loadStats, (state) => ({ ...state, isLoading: true, error: null })),
    on(DashboardActions.loadStatsSuccess, (state, { stats }) => ({ ...state, isLoading: false, stats })),
    on(DashboardActions.loadStatsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
    
    // Optimistic updates for Deals
    on(CRMActions.createDealSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalDealsCount: state.stats.totalDealsCount + 1 } : null
    })),
    on(CRMActions.deleteDealSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalDealsCount: Math.max(0, state.stats.totalDealsCount - 1) } : null
    })),

    // Optimistic updates for Contacts
    on(CRMActions.createContactSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalContacts: state.stats.totalContacts + 1 } : null
    })),
    on(CRMActions.deleteContactSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalContacts: Math.max(0, state.stats.totalContacts - 1) } : null
    })),

    // Optimistic updates for Tasks
    on(TasksActions.createTaskSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalTasks: state.stats.totalTasks + 1 } : null
    })),
    on(TasksActions.deleteTaskSuccess, (state) => ({
      ...state,
      stats: state.stats ? { ...state.stats, totalTasks: Math.max(0, state.stats.totalTasks - 1) } : null
    })),
  ),
});

export const {
  name: dashboardFeatureKey,
  reducer: dashboardReducer,
  selectStats,
  selectIsLoading,
  selectError,
} = dashboardFeature;
