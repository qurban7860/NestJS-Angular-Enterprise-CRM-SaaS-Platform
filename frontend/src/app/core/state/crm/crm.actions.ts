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

    // ── Deals ──────────────────────
    'Load Deals': emptyProps(),
    'Load Deals Success': props<{ deals: any[] }>(),
    'Load Deals Failure': props<{ error: string }>(),

    'Create Deal': props<{ deal: any }>(),
    'Create Deal Success': props<{ deal: any }>(),
    'Create Deal Failure': props<{ error: string }>(),

    'Update Deal Stage': props<{ id: string; stage: string }>(),
    'Update Deal Stage Success': props<{ deal: any }>(),
    'Update Deal Stage Failure': props<{ error: string; originalStage: string; dealId: string }>(),
  }
});
