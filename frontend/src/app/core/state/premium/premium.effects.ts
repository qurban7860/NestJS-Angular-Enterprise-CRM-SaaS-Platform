import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { PremiumActions } from './premium.actions';
import { PremiumService } from '../../services/premium.service';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class PremiumEffects {
  private actions$ = inject(Actions);
  private premiumService = inject(PremiumService);

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.loadCustomRoles),
      mergeMap(() =>
        this.premiumService.getCustomRoles().pipe(
          map((roles) => PremiumActions.loadCustomRolesSuccess({ roles })),
          catchError((error) => of(PremiumActions.loadCustomRolesFailure({ error: error.message })))
        )
      )
    )
  );

  loadWorkflows$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.loadWorkflows),
      mergeMap(() =>
        this.premiumService.getWorkflows().pipe(
          map((workflows) => PremiumActions.loadWorkflowsSuccess({ workflows })),
          catchError((error) => of(PremiumActions.loadWorkflowsFailure({ error: error.message })))
        )
      )
    )
  );

  loadReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.loadReports),
      mergeMap(() =>
        this.premiumService.getReports().pipe(
          map((reports) => PremiumActions.loadReportsSuccess({ reports })),
          catchError((error) => of(PremiumActions.loadReportsFailure({ error: error.message })))
        )
      )
    )
  );

  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.createCustomRole),
      mergeMap(({ role }) =>
        this.premiumService.createCustomRole(role).pipe(
          map((newRole) => PremiumActions.createCustomRoleSuccess({ role: newRole })),
          catchError((error) => of(PremiumActions.createCustomRoleFailure({ error: error.message })))
        )
      )
    )
  );

  createWorkflow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.createWorkflow),
      mergeMap(({ workflow }) =>
        this.premiumService.createWorkflow(workflow).pipe(
          map((newWorkflow) => PremiumActions.createWorkflowSuccess({ workflow: newWorkflow })),
          catchError((error) => of(PremiumActions.createWorkflowFailure({ error: error.message })))
        )
      )
    )
  );

  createReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.createReport),
      mergeMap(({ report }) =>
        this.premiumService.createReport(report).pipe(
          map((newReport) => PremiumActions.createReportSuccess({ report: newReport })),
          catchError((error) => of(PremiumActions.createReportFailure({ error: error.message })))
        )
      )
    )
  );

  assignRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PremiumActions.assignRole),
      mergeMap(({ roleId, userId }) =>
        this.premiumService.assignRole(roleId, userId).pipe(
          mergeMap((result) => [
            PremiumActions.assignRoleSuccess({ result }),
            PremiumActions.loadCustomRoles()
          ]),
          catchError((error) => of(PremiumActions.assignRoleFailure({ error: error.message })))
        )
      )
    )
  );
}
