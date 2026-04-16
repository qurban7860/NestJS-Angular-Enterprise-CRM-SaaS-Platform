import { createFeature, createReducer, on } from '@ngrx/store';
import { CRMActions } from './crm.actions';

export interface CRMState {
  contacts: any[];
  deals: any[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: CRMState = {
  contacts: [],
  deals: [],
  isLoading: false,
  error: null,
};

export const crmFeature = createFeature({
  name: 'crm',
  reducer: createReducer(
    initialState,
    // ── Contacts ────────────────────────────────────────────────
    on(CRMActions.loadContacts, (state) => ({ ...state, isLoading: true, error: null })),
    on(CRMActions.loadContactsSuccess, (state, { contacts }) => ({ ...state, isLoading: false, contacts })),
    on(CRMActions.loadContactsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.createContact, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.createContactSuccess, (state, { contact }) => ({ 
      ...state, 
      isLoading: false, 
      contacts: [contact, ...state.contacts] 
    })),
    on(CRMActions.createContactFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // ── Deals ───────────────────────────────────────────────────
    on(CRMActions.loadDeals, (state) => ({ ...state, isLoading: true, error: null })),
    on(CRMActions.loadDealsSuccess, (state, { deals }) => ({ ...state, isLoading: false, deals })),
    on(CRMActions.loadDealsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.createDeal, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.createDealSuccess, (state, { deal }) => ({
      ...state,
      isLoading: false,
      deals: [deal, ...state.deals]
    })),
    on(CRMActions.createDealFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // Optimistic Update: instantly change the deals stage
    on(CRMActions.updateDealStage, (state, { id, stage }) => ({
      ...state,
      deals: state.deals.map(d => d.id === id ? { ...d, stage } : d)
    })),
    // Revert Optimistic Update on failure
    on(CRMActions.updateDealStageFailure, (state, { dealId, originalStage }) => ({
      ...state,
      deals: state.deals.map(d => d.id === dealId && originalStage ? { ...d, stage: originalStage } : d)
    })),
  ),
});

export const {
  name,
  reducer,
  selectContacts,
  selectDeals,
  selectIsLoading,
  selectError,
} = crmFeature;
