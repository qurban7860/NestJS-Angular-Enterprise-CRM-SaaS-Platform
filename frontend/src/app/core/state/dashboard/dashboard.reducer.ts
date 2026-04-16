import { createFeature, createReducer, on } from '@ngrx/store';
import { DashboardActions } from './dashboard.actions';
import { DashboardStats } from '../../services/dashboard.service';

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
  ),
});

export const {
  name: dashboardFeatureKey,
  reducer: dashboardReducer,
  selectStats,
  selectIsLoading,
  selectError,
} = dashboardFeature;
