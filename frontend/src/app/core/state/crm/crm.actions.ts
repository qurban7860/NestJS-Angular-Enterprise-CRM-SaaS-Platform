import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CRMActions = createActionGroup({
  source: 'CRM',
  events: {
    // ── Contacts ────────────────────────────────────────────────
    'Load Contacts': emptyProps(),
    'Load Contacts Success': props<{ contacts: any[] }>(),
    'Load Contacts Failure': props<{ error: string }>(),

    'Create Contact': props<{ contact: any }>(),
    'Create Contact Success': props<{ contact: any }>(),
    'Create Contact Failure': props<{ error: string }>(),

    // ── Deals (Reserved for next sub-step) ──────────────────────
    'Load Deals': emptyProps(),
    'Load Deals Success': props<{ deals: any[] }>(),
    'Load Deals Failure': props<{ error: string }>(),
  }
});
