import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CrmService } from '../../services/crm.service';
import { CRMActions } from './crm.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
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

  loadContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.loadContact),
      mergeMap(({ id }) =>
        this.crmService.getContact(id).pipe(
          map(contact => CRMActions.loadContactSuccess({ contact })),
          catchError(error => of(CRMActions.loadContactFailure({ error: error.message })))
        )
      )
    )
  );

  createContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.createContact),
      mergeMap(({ contact }) =>
        this.crmService.createContact(contact).pipe(
          switchMap(newContact => [
            CRMActions.createContactSuccess({ contact: newContact }),
            ToastActions.showToast({ 
              message: 'New contact added successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.createContactFailure({ error: error.message })))
        )
      )
    )
  );

  updateContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.updateContact),
      mergeMap(({ id, contact }) =>
        this.crmService.updateContact(id, contact).pipe(
          switchMap(updatedContact => [
            CRMActions.updateContactSuccess({ contact: updatedContact }),
            ToastActions.showToast({ 
              message: 'Contact updated successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.updateContactFailure({ error: error.message })))
        )
      )
    )
  );

  deleteContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.deleteContact),
      mergeMap(({ id }) =>
        this.crmService.deleteContact(id).pipe(
          switchMap(() => [
            CRMActions.deleteContactSuccess({ id }),
            ToastActions.showToast({ 
              message: 'Contact deleted successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.deleteContactFailure({ error: error.message })))
        )
      )
    )
  );

  exportContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.exportContacts),
      mergeMap(() =>
        this.crmService.exportContacts().pipe(
          map(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'contacts.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return CRMActions.exportContactsSuccess();
          }),
          catchError(error => of(CRMActions.exportContactsFailure({ error: error.message })))
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

  loadDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.loadDeal),
      mergeMap(({ id }) =>
        this.crmService.getDeal(id).pipe(
          map(deal => CRMActions.loadDealSuccess({ deal })),
          catchError(error => of(CRMActions.loadDealFailure({ error: error.message })))
        )
      )
    )
  );

  createDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.createDeal),
      mergeMap(({ deal }) =>
        this.crmService.createDeal(deal).pipe(
          switchMap(newDeal => [
            CRMActions.createDealSuccess({ deal: newDeal }),
            ToastActions.showToast({ 
              message: 'Pipeline deal created successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.createDealFailure({ error: error.message })))
        )
      )
    )
  );

  updateDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.updateDeal),
      mergeMap(({ id, deal }) =>
        this.crmService.updateDeal(id, deal).pipe(
          switchMap(updatedDeal => [
            CRMActions.updateDealSuccess({ deal: updatedDeal }),
            ToastActions.showToast({ 
              message: 'Deal updated successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.updateDealFailure({ error: error.message })))
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
            return of(CRMActions.updateDealStageFailure({ 
              error: error.message, 
              originalStage: '',
              dealId: id 
            }));
          })
        )
      )
    )
  );

  deleteDeal$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.deleteDeal),
      mergeMap(({ id }) =>
        this.crmService.deleteDeal(id).pipe(
          switchMap(() => [
            CRMActions.deleteDealSuccess({ id }),
            ToastActions.showToast({ 
              message: 'Deal deleted successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(CRMActions.deleteDealFailure({ error: error.message })))
        )
      )
    )
  );

  exportDeals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CRMActions.exportDeals),
      mergeMap(() =>
        this.crmService.exportDeals().pipe(
          map(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'deals.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return CRMActions.exportDealsSuccess();
          }),
          catchError(error => of(CRMActions.exportDealsFailure({ error: error.message })))
        )
      )
    )
  );
}
