import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const PremiumActions = createActionGroup({
  source: 'Premium Features',
  events: {
    'Load Custom Roles': emptyProps(),
    'Load Custom Roles Success': props<{ roles: any[] }>(),
    'Load Custom Roles Failure': props<{ error: string }>(),
    
    'Load Workflows': emptyProps(),
    'Load Workflows Success': props<{ workflows: any[] }>(),
    'Load Workflows Failure': props<{ error: string }>(),
    
    'Load Reports': emptyProps(),
    'Load Reports Success': props<{ reports: any[] }>(),
    'Load Reports Failure': props<{ error: string }>(),
  }
});
