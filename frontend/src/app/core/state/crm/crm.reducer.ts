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

    on(CRMActions.loadContact, (state) => ({ ...state, isLoading: true, error: null })),
    on(CRMActions.loadContactSuccess, (state, { contact }) => {
      const exists = state.contacts.find(c => c.id === contact.id);
      return {
        ...state,
        isLoading: false,
        contacts: exists ? state.contacts.map(c => c.id === contact.id ? contact : c) : [...state.contacts, contact]
      };
    }),
    on(CRMActions.loadContactFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.createContact, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.createContactSuccess, (state, { contact }) => ({ 
      ...state, 
      isLoading: false, 
      contacts: [contact, ...state.contacts] 
    })),
    on(CRMActions.createContactFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.updateContact, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.updateContactSuccess, (state, { contact }) => ({
      ...state,
      isLoading: false,
      contacts: state.contacts.map(c => c.id === contact.id ? contact : c)
    })),
    on(CRMActions.updateContactFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.deleteContact, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.deleteContactSuccess, (state, { id }) => ({
      ...state,
      isLoading: false,
      contacts: state.contacts.filter(c => c.id !== id)
    })),
    on(CRMActions.deleteContactFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.exportContacts, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.exportContactsSuccess, (state) => ({ ...state, isLoading: false })),
    on(CRMActions.exportContactsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    // ── Deals ───────────────────────────────────────────────────
    on(CRMActions.loadDeals, (state) => ({ ...state, isLoading: true, error: null })),
    on(CRMActions.loadDealsSuccess, (state, { deals }) => ({ ...state, isLoading: false, deals })),
    on(CRMActions.loadDealsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.loadDeal, (state) => ({ ...state, isLoading: true, error: null })),
    on(CRMActions.loadDealSuccess, (state, { deal }) => {
      const exists = state.deals.find(d => d.id === deal.id);
      return {
        ...state,
        isLoading: false,
        deals: exists ? state.deals.map(d => d.id === deal.id ? deal : d) : [...state.deals, deal]
      };
    }),
    on(CRMActions.loadDealFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.createDeal, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.createDealSuccess, (state, { deal }) => ({
      ...state,
      isLoading: false,
      deals: [deal, ...state.deals]
    })),
    on(CRMActions.createDealFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.updateDeal, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.updateDealSuccess, (state, { deal }) => ({
      ...state,
      isLoading: false,
      deals: state.deals.map(d => d.id === deal.id ? deal : d)
    })),
    on(CRMActions.updateDealFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

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

    on(CRMActions.deleteDeal, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.deleteDealSuccess, (state, { id }) => ({
      ...state,
      isLoading: false,
      deals: state.deals.filter(d => d.id !== id)
    })),
    on(CRMActions.deleteDealFailure, (state, { error }) => ({ ...state, isLoading: false, error })),

    on(CRMActions.exportDeals, (state) => ({ ...state, isLoading: true })),
    on(CRMActions.exportDealsSuccess, (state) => ({ ...state, isLoading: false })),
    on(CRMActions.exportDealsFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
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
