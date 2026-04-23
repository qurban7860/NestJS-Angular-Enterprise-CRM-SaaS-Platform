export interface PlanLimits {
  maxUsers: number;
  maxContacts: number;
  maxDeals: number;
  maxTasks: number;
  hasAdvancedReporting: boolean;
  hasCustomRBAC: boolean;
  hasAutomations: boolean;
  hasBulkActions: boolean;
  hasExport: boolean;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  'FREE': {
    maxUsers: 2,
    maxContacts: 50,
    maxDeals: 10,
    maxTasks: 20,
    hasAdvancedReporting: false,
    hasCustomRBAC: false,
    hasAutomations: false,
    hasBulkActions: false,
    hasExport: false,
  },
  'PREMIUM': {
    maxUsers: 10,
    maxContacts: 1000,
    maxDeals: 100,
    maxTasks: 500,
    hasAdvancedReporting: true,
    hasCustomRBAC: true,
    hasAutomations: true,
    hasBulkActions: true,
    hasExport: true,
  },
  'ENTERPRISE': {
    maxUsers: 100,
    maxContacts: 100000,
    maxDeals: 10000,
    maxTasks: 10000,
    hasAdvancedReporting: true,
    hasCustomRBAC: true,
    hasAutomations: true,
    hasBulkActions: true,
    hasExport: true,
  },
};
