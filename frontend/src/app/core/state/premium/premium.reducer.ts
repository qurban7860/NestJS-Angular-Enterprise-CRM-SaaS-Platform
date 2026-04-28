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

  on(PremiumActions.updateCustomRoleSuccess, (state, { role }) => ({
    ...state,
    roles: state.roles.map(r => r.id === role.id ? role : r),
    loading: false
  })),

  on(PremiumActions.deleteCustomRoleSuccess, (state, { id }) => ({
    ...state,
    roles: state.roles.filter(r => r.id !== id),
    loading: false
  })),
  
  on(PremiumActions.createWorkflowSuccess, (state, { workflow }) => ({ 
    ...state, 
    workflows: [...state.workflows, workflow],
    loading: false 
  })),

  on(PremiumActions.toggleWorkflowSuccess, (state, { workflow }) => ({
    ...state,
    workflows: state.workflows.map(w => w.id === workflow.id ? workflow : w),
    loading: false
  })),

  on(PremiumActions.deleteWorkflowSuccess, (state, { id }) => ({
    ...state,
    workflows: state.workflows.filter(w => w.id !== id),
    loading: false
  })),
  
  on(PremiumActions.createReportSuccess, (state, { report }) => ({ 
    ...state, 
    reports: [...state.reports, report],
    loading: false 
  })),

  on(PremiumActions.deleteReportSuccess, (state, { id }) => ({
    ...state,
    reports: state.reports.filter(r => r.id !== id),
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
