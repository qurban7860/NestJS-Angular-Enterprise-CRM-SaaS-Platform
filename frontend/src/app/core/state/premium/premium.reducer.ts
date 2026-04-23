import { createReducer, on } from '@ngrx/store';
import { PremiumActions } from './premium.actions';

export interface PremiumState {
  roles: any[];
  workflows: any[];
  reports: any[];
  loading: boolean;
  error: string | null;
}

export const initialState: PremiumState = {
  roles: [],
  workflows: [],
  reports: [],
  loading: false,
  error: null,
};

export const premiumReducer = createReducer(
  initialState,
  on(PremiumActions.loadCustomRoles, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadCustomRolesSuccess, (state, { roles }) => ({ ...state, roles, loading: false })),
  
  on(PremiumActions.loadWorkflows, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadWorkflowsSuccess, (state, { workflows }) => ({ ...state, workflows, loading: false })),
  
  on(PremiumActions.loadReports, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadReportsSuccess, (state, { reports }) => ({ ...state, reports, loading: false })),
  
  on(
    PremiumActions.loadCustomRolesFailure,
    PremiumActions.loadWorkflowsFailure,
    PremiumActions.loadReportsFailure,
    (state, { error }) => ({ ...state, error, loading: false })
  )
);
