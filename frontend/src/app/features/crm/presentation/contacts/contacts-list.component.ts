import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CRMActions } from '../../../../core/state/crm/crm.actions';
import {
  selectContacts,
  selectIsLoading,
} from '../../../../core/state/crm/crm.reducer';
import {
  FormControl,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { map, startWith, combineLatest } from 'rxjs';
import { ButtonComponent } from '../../../tasks/presentation/button.component';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, ConfirmModalComponent],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 border border-brand-border rounded-2xl p-4 sm:p-6 glass-panel gap-4"
      >
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Contacts</h1>
          <p class="text-brand-secondary text-xs sm:text-sm mt-1">
            Manage your customer relationships and leads
          </p>
        </div>
        <app-button variant="premium" (clicked)="openCreateModal()" customClass="w-full sm:w-auto justify-center">
          <span class="text-lg">+</span> Add Contact
        </app-button>
      </div>

      <!-- Add Contact Modal Overlay -->
      @if (isModalOpen) {
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200 p-4"
        >
          <div class="glass-panel w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <app-button
              variant="none"
              (clicked)="closeCreateModal()"
              customClass="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </app-button>
            <h2 class="text-xl sm:text-2xl font-bold mb-6">{{ editingContactId ? 'Edit Contact' : 'Add New Contact' }}</h2>
            <form
              [formGroup]="contactForm"
              (ngSubmit)="submitContact()"
              class="space-y-4"
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-medium text-brand-secondary mb-1"
                    >First Name</label
                  >
                  <input
                    formControlName="firstName"
                    type="text"
                    placeholder="First Name"
                    class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-brand-secondary mb-1"
                    >Last Name</label
                  >
                  <input
                    formControlName="lastName"
                    type="text"
                    placeholder="Last Name"
                    class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-brand-secondary mb-1"
                  >Email Address</label
                >
                <input
                  formControlName="email"
                  type="email"
                  placeholder="Email Address"
                  class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-brand-secondary mb-1"
                  >Phone Number (Optional)</label
                >
                <input
                  formControlName="phone"
                  type="text"
                  placeholder="Phone Number"
                  class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <app-button
                type="submit"
                [disabled]="contactForm.invalid"
                variant="premium"
                customClass="w-full mt-6 py-3 justify-center"
                >{{ editingContactId ? 'Update Contact' : 'Save Contact' }}</app-button
              >
            </form>
          </div>
        </div>
      }

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div class="relative w-full sm:w-96">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </span>
          <input
            [formControl]="searchControl"
            type="text"
            placeholder="Search contacts..."
            class="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-all text-sm"
          />
        </div>

        <div class="flex gap-2 w-full sm:w-auto">
          <app-button variant="secondary" (clicked)="exportContacts()" customClass="flex-1 sm:flex-none justify-center">Export</app-button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-panel overflow-hidden border border-white/5 sm:border-brand-border">
        @if (isLoading$ | async) {
          <div class="flex flex-col items-center justify-center p-12 sm:p-20 space-y-4">
            <div
              class="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-brand-secondary animate-pulse text-sm">
              Retrieving contacts...
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <!-- Desktop Table -->
            <table class="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr class="border-b border-brand-border bg-white/5">
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-brand-secondary"
                  >
                    Contact
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-brand-secondary"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-brand-secondary"
                  >
                    Email
                  </th>
                  <th
                    class="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-brand-secondary text-right"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-border/30">
                @for (contact of filteredContacts$ | async; track contact.id) {
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-9 h-9 rounded-lg bg-gradient-premium flex items-center justify-center text-xs font-bold shadow-lg"
                        >
                          {{ contact.fullName.charAt(0) }}
                        </div>
                        <span class="font-medium text-sm">{{ contact.fullName }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        [class]="getStatusClass(contact.status)"
                        class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      >
                        {{ contact.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-brand-secondary text-sm">
                      {{ contact.email }}
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-1">
                        <app-button variant="ghost" (clicked)="editContact(contact)" customClass="!p-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </app-button>
                        <app-button variant="ghost" (clicked)="deleteContact(contact)" customClass="text-red-400 hover:text-red-300 !p-2">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </app-button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="md:hidden divide-y divide-brand-border/30">
               @for (contact of filteredContacts$ | async; track contact.id) {
                 <div class="p-4 space-y-3">
                   <div class="flex items-center justify-between">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-gradient-premium flex items-center justify-center text-xs font-bold shadow-lg">
                          {{ contact.fullName.charAt(0) }}
                        </div>
                        <div>
                          <p class="font-bold text-sm">{{ contact.fullName }}</p>
                          <p class="text-[10px] text-brand-secondary">{{ contact.email }}</p>
                        </div>
                     </div>
                     <span [class]="getStatusClass(contact.status)" class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {{ contact.status }}
                      </span>
                   </div>
                   <div class="flex justify-end gap-2 pt-2 border-t border-white/5">
                      <app-button variant="secondary" (clicked)="editContact(contact)" customClass="!py-1.5 !px-3 text-xs">Edit</app-button>
                      <app-button variant="ghost" (clicked)="deleteContact(contact)" customClass="text-red-400 !py-1.5 !px-3 text-xs">Delete</app-button>
                   </div>
                 </div>
               }
            </div>

            @if (!((filteredContacts$ | async)?.length)) {
              <div class="p-20 text-center">
                <div class="flex flex-col items-center opacity-40">
                  <svg
                    class="w-16 h-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  <p class="text-lg font-bold">No contacts found</p>
                  <p class="text-xs mt-1">
                    Start by adding your first customer lead.
                  </p>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (isConfirmModalOpen) {
        <app-confirm-modal
          title="Delete Contact"
          [message]="'Are you sure you want to delete ' + contactToDelete?.fullName + '?'"
          confirmText="Delete"
          (confirm)="confirmDelete()"
          (cancel)="cancelDelete()"
        ></app-confirm-modal>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ContactsListComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  contacts$ = this.store.select(selectContacts);
  isLoading$ = this.store.select(selectIsLoading);
  searchControl = new FormControl('', { nonNullable: true });

  isModalOpen = false;
  isConfirmModalOpen = false;
  contactToDelete: any = null;
  editingContactId: string | null = null;
  contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    companyId: [null],
  });

  filteredContacts$ = combineLatest([
    this.contacts$,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([contacts, search]) => {
      const term = search.toLowerCase();
      if (!term) return contacts;
      return contacts.filter(
        (c) =>
          c.fullName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term),
      );
    }),
  );

  ngOnInit() {
    this.store.dispatch(CRMActions.loadContacts());
  }

  openCreateModal() {
    this.editingContactId = null;
    this.contactForm.reset();
    this.isModalOpen = true;
  }
  closeCreateModal() {
    this.isModalOpen = false;
    this.editingContactId = null;
    this.contactForm.reset();
  }

  submitContact() {
    if (this.contactForm.valid) {
      if (this.editingContactId) {
        this.store.dispatch(
          CRMActions.updateContact({ id: this.editingContactId, contact: this.contactForm.value }),
        );
      } else {
        this.store.dispatch(
          CRMActions.createContact({ contact: this.contactForm.value }),
        );
      }
      this.closeCreateModal();
    }
  }

  getStatusClass(status: string): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium ';
    switch (status) {
      case 'LEAD':
        return (
          base +
          'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
        );
      case 'QUALIFIED':
        return (
          base +
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        );
      case 'CUSTOMER':
        return base + 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'CHURNED':
        return base + 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return base + 'bg-gray-500/10 text-gray-400';
    }
  }

  exportContacts() {
    this.store.dispatch(CRMActions.exportContacts());
  }

  toggleFilters() {
    alert('Advanced filter panel opening...');
  }

  editContact(contact: any) {
    this.editingContactId = contact.id;
    // Basic split for demo purposes since fullName comes from backend 
    const [firstName = '', lastName = ''] = (contact.fullName || '').split(' ');
    this.contactForm.patchValue({
      firstName,
      lastName,
      email: contact.email,
      phone: contact.phone || '',
      companyId: null
    });
    this.isModalOpen = true;
  }

  deleteContact(contact: any) {
    this.contactToDelete = contact;
    this.isConfirmModalOpen = true;
  }

  confirmDelete() {
    if (this.contactToDelete) {
      this.store.dispatch(CRMActions.deleteContact({ id: this.contactToDelete.id }));
      this.contactToDelete = null;
    }
    this.isConfirmModalOpen = false;
  }

  cancelDelete() {
    this.isConfirmModalOpen = false;
    this.contactToDelete = null;
  }
}
