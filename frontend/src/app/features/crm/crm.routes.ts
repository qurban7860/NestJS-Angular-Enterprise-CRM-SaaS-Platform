import { Routes } from '@angular/router';
import { ContactsListComponent } from './presentation/contacts/contacts-list.component';
import { DealsKanbanComponent } from './presentation/deals/deals-kanban.component';

export const CRM_ROUTES: Routes = [
  { path: 'contacts', component: ContactsListComponent },
  { path: 'deals', component: DealsKanbanComponent },
  { path: '', redirectTo: 'contacts', pathMatch: 'full' }
];
