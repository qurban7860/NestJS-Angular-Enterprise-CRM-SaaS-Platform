import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CRMActions = createActionGroup({
  source: 'CRM',
  events: {
    // ── Contacts ────────────────────────────────────────────────
    'Load Contacts': emptyProps(),
    'Load Contacts Success': props<{ contacts: any[] }>(),
    'Load Contacts Failure': props<{ error: string }>(),

    'Load Contact': props<{ id: string }>(),
    'Load Contact Success': props<{ contact: any }>(),
    'Load Contact Failure': props<{ error: string }>(),

    'Create Contact': props<{ contact: any }>(),
    'Create Contact Success': props<{ contact: any }>(),
    'Create Contact Failure': props<{ error: string }>(),

    'Update Contact': props<{ id: string; contact: any }>(),
    'Update Contact Success': props<{ contact: any }>(),
    'Update Contact Failure': props<{ error: string }>(),

    'Delete Contact': props<{ id: string }>(),
    'Delete Contact Success': props<{ id: string }>(),
    'Delete Contact Failure': props<{ error: string }>(),

    'Export Contacts': emptyProps(),
    'Export Contacts Success': emptyProps(),
    'Export Contacts Failure': props<{ error: string }>(),

    // ── Deals ──────────────────────
    'Load Deals': emptyProps(),
    'Load Deals Success': props<{ deals: any[] }>(),
    'Load Deals Failure': props<{ error: string }>(),

    'Load Deal': props<{ id: string }>(),
    'Load Deal Success': props<{ deal: any }>(),
    'Load Deal Failure': props<{ error: string }>(),

    'Create Deal': props<{ deal: any }>(),
    'Create Deal Success': props<{ deal: any }>(),
    'Create Deal Failure': props<{ error: string }>(),

    'Update Deal': props<{ id: string; deal: any }>(),
    'Update Deal Success': props<{ deal: any }>(),
    'Update Deal Failure': props<{ error: string }>(),

    'Update Deal Stage': props<{ id: string; stage: string }>(),
    'Update Deal Stage Success': props<{ deal: any }>(),
    'Update Deal Stage Failure': props<{ error: string; originalStage: string; dealId: string }>(),

    'Delete Deal': props<{ id: string }>(),
    'Delete Deal Success': props<{ id: string }>(),
    'Delete Deal Failure': props<{ error: string }>(),

    'Export Deals': emptyProps(),
    'Export Deals Success': emptyProps(),
    'Export Deals Failure': props<{ error: string }>(),
  }
});
