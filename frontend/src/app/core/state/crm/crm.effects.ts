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
}
