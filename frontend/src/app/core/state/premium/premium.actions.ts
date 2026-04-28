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

    'Create Custom Role': props<{ role: any }>(),
    'Create Custom Role Success': props<{ role: any }>(),
    'Create Custom Role Failure': props<{ error: string }>(),

    'Update Custom Role': props<{ id: string; role: any }>(),
    'Update Custom Role Success': props<{ role: any }>(),
    'Update Custom Role Failure': props<{ error: string }>(),

    'Delete Custom Role': props<{ id: string }>(),
    'Delete Custom Role Success': props<{ id: string }>(),
    'Delete Custom Role Failure': props<{ error: string }>(),

    'Create Workflow': props<{ workflow: any }>(),
    'Create Workflow Success': props<{ workflow: any }>(),
    'Create Workflow Failure': props<{ error: string }>(),

    'Toggle Workflow': props<{ id: string; isActive: boolean }>(),
    'Toggle Workflow Success': props<{ workflow: any }>(),
    'Toggle Workflow Failure': props<{ error: string }>(),

    'Delete Workflow': props<{ id: string }>(),
    'Delete Workflow Success': props<{ id: string }>(),
    'Delete Workflow Failure': props<{ error: string }>(),

    'Create Report': props<{ report: any }>(),
    'Create Report Success': props<{ report: any }>(),
    'Create Report Failure': props<{ error: string }>(),

    'Delete Report': props<{ id: string }>(),
    'Delete Report Success': props<{ id: string }>(),
    'Delete Report Failure': props<{ error: string }>(),

    'Assign Role': props<{ roleId: string; userId: string }>(),
    'Assign Role Success': props<{ result: any }>(),
    'Assign Role Failure': props<{ error: string }>(),

    'Show Upgrade Modal': props<{ feature?: string; limit?: number; currentCount?: number }>(),
    'Quota Exceeded': props<{ payload: any }>(),
    'Clear Quota Error': emptyProps(),
  }
});
