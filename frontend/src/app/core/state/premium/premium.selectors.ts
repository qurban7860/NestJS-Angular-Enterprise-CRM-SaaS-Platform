import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PremiumState, premiumFeatureKey } from './premium.reducer';

export const selectPremiumState = createFeatureSelector<PremiumState>(premiumFeatureKey);

export const selectPremiumRoles = createSelector(
  selectPremiumState,
  (state) => state.roles
);

export const selectPremiumWorkflows = createSelector(
  selectPremiumState,
  (state) => state.workflows
);

export const selectPremiumReports = createSelector(
  selectPremiumState,
  (state) => state.reports
);

export const selectPremiumLoading = createSelector(
  selectPremiumState,
  (state) => state.loading
);

export const selectPremiumError = createSelector(
  selectPremiumState,
  (state) => state.error
);

export const selectQuotaExceededPayload = createSelector(
  selectPremiumState,
  (state) => state.quotaExceededPayload
);
