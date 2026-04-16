import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CrmService } from '../../services/crm.service';
import { CRMActions } from './crm.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ToastActions } from '../toast/toast.actions';

@Injectable()
export class CRMEffects {
  private actions$ = inject(Actions);
  private crmService = inject(CrmService);

  loadContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.loadContacts),
      mergeMap(() =>
        this.crmService.getContacts().pipe(
          map(contacts => CRMActions.loadContactsSuccess({ contacts })),
          catchError(error => of(CRMActions.loadContactsFailure({ error: error.message })))
        )
      )
    )
  );

  createContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.createContact),
      mergeMap(({ contact }) =>
        this.crmService.createContact(contact).pipe(
          map(newContact => CRMActions.createContactSuccess({ contact: newContact })),
          tap(() => ToastActions.showToast({ 
            message: 'New contact added successfully', 
            toastType: 'success' 
          })),
          catchError(error => of(CRMActions.createContactFailure({ error: error.message })))
        )
      )
    )
  );

  loadDeals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.loadDeals),
      mergeMap(() =>
        this.crmService.getDeals().pipe(
          map(deals => CRMActions.loadDealsSuccess({ deals })),
          catchError(error => of(CRMActions.loadDealsFailure({ error: error.message })))
        )
      )
    )
  );

  createDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.createDeal),
      mergeMap(({ deal }) =>
        this.crmService.createDeal(deal).pipe(
          map(newDeal => CRMActions.createDealSuccess({ deal: newDeal })),
          tap(() => ToastActions.showToast({ 
            message: 'Pipeline deal created successfully', 
            toastType: 'success' 
          })),
          catchError(error => of(CRMActions.createDealFailure({ error: error.message })))
        )
      )
    )
  );

  updateDealStage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.updateDealStage),
      mergeMap(({ id, stage }) =>
        this.crmService.updateDealStage(id, stage).pipe(
          map(updatedDeal => CRMActions.updateDealStageSuccess({ deal: updatedDeal })),
          catchError(error => {
            // Note: Optimistic update rollback should technically pass originalStage
            return of(CRMActions.updateDealStageFailure({ 
              error: error.message, 
              originalStage: '', // Simplified for now since we just log or show error
              dealId: id 
            }));
          })
        )
      )
    )
  );
}
