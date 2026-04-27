import { createReducer, on } from '@ngrx/store';
import { PremiumActions } from './premium.actions';

export const premiumFeatureKey = 'premium';

export interface PremiumState {
  roles: any[];
  workflows: any[];
  reports: any[];
  loading: boolean;
  error: string | null;
  quotaExceededPayload: any | null;
}

export const initialState: PremiumState = {
  roles: [],
  workflows: [],
  reports: [],
  loading: false,
  error: null,
  quotaExceededPayload: null,
};

export const premiumReducer = createReducer(
  initialState,
  on(PremiumActions.loadCustomRoles, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadCustomRolesSuccess, (state, { roles }) => ({ ...state, roles, loading: false })),
  
  on(PremiumActions.loadWorkflows, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadWorkflowsSuccess, (state, { workflows }) => ({ ...state, workflows, loading: false })),
  
  on(PremiumActions.loadReports, (state) => ({ ...state, loading: true })),
  on(PremiumActions.loadReportsSuccess, (state, { reports }) => ({ ...state, reports, loading: false })),
  
  on(PremiumActions.createCustomRoleSuccess, (state, { role }) => ({ 
    ...state, 
    roles: [...state.roles, role],
    loading: false 
  })),
  
  on(PremiumActions.createWorkflowSuccess, (state, { workflow }) => ({ 
    ...state, 
    workflows: [...state.workflows, workflow],
    loading: false 
  })),
  
  on(PremiumActions.createReportSuccess, (state, { report }) => ({ 
    ...state, 
    reports: [...state.reports, report],
    loading: false 
  })),

  on(PremiumActions.quotaExceeded, (state, { payload }) => ({
    ...state,
    quotaExceededPayload: payload,
    loading: false
  })),

  on(PremiumActions.showUpgradeModal, (state, { feature, limit, currentCount }) => ({
    ...state,
    quotaExceededPayload: feature ? { feature, limit, currentCount } : state.quotaExceededPayload
  })),

  on(PremiumActions.clearQuotaError, (state) => ({
    ...state,
    quotaExceededPayload: null
  })),
  
  on(
    PremiumActions.loadCustomRolesFailure,
    PremiumActions.loadWorkflowsFailure,
    PremiumActions.loadReportsFailure,
    (state, { error }) => ({ ...state, error, loading: false })
  )
);
