import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { CRMActions } from '../../../../core/state/crm/crm.actions';
import { selectContacts, selectIsLoading } from '../../../../core/state/crm/crm.reducer';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { map, startWith, combineLatest } from 'rxjs';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
      <div class="flex justify-between items-center bg-white/5 border border-brand-border rounded-2xl p-6 glass-panel">
        <div>
          <h1 class="text-2xl font-bold">Contacts</h1>
          <p class="text-brand-secondary text-sm mt-1">Manage your customer relationships and leads</p>
        </div>
        <button (click)="openCreateModal()" class="premium-button flex items-center gap-2">
          <span class="text-lg">+</span> Add Contact
        </button>
      </div>

      <!-- Add Contact Modal Overlay -->
      @if (isModalOpen) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div class="glass-panel w-full max-w-md p-8 relative">
            <button (click)="closeCreateModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-2xl font-bold mb-6">Add New Contact</h2>
            <form [formGroup]="contactForm" (ngSubmit)="submitContact()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">First Name</label>
                  <input formControlName="firstName" type="text" placeholder="First Name" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all">
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Last Name</label>
                  <input formControlName="lastName" type="text" placeholder="Last Name" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Email Address</label>
                <input formControlName="email" type="email" placeholder="Email Address" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Phone Number (Optional)</label>
                <input formControlName="phone" type="text" placeholder="Phone Number" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>
              <button type="submit" [disabled]="contactForm.invalid" class="premium-button w-full mt-6 py-3 disabled:opacity-50">Save Contact</button>
            </form>
          </div>
        </div>
      }

      <!-- Filters & Search -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Search contacts by name or email..." 
            class="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-all">
        </div>

        <div class="flex gap-2">
           <button class="px-4 py-2 rounded-lg bg-white/5 border border-brand-border text-sm hover:bg-white/10 transition-all">Export</button>
           <button class="px-4 py-2 rounded-lg bg-white/5 border border-brand-border text-sm hover:bg-white/10 transition-all">Filters</button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="glass-panel overflow-hidden">
        @if (isLoading$ | async) {
          <div class="flex flex-col items-center justify-center p-20 space-y-4">
             <div class="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
             <p class="text-brand-secondary animate-pulse">Retrieving contacts...</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-brand-border bg-white/5">
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-secondary">Contact</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-secondary">Status</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-secondary">Email</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-secondary">Company</th>
                  <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-brand-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-brand-border/50">
                @for (contact of filteredContacts$ | async; track contact.id) {
                  <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-premium flex items-center justify-center text-sm font-bold">
                          {{ contact.fullName.charAt(0) }}
                        </div>
                        <span class="font-medium">{{ contact.fullName }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="getStatusClass(contact.status)" class="px-2.5 py-1 rounded-full text-xs font-medium">
                        {{ contact.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-brand-secondary text-sm">{{ contact.email }}</td>
                    <td class="px-6 py-4 text-brand-secondary text-sm">--</td>
                    <td class="px-6 py-4 text-right">
                      <button class="p-2 hover:bg-brand-primary/10 rounded-lg text-brand-secondary hover:text-brand-primary transition-all">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-20 text-center">
                      <div class="flex flex-col items-center opacity-40">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <p class="text-xl font-medium">No contacts found</p>
                        <p class="text-sm">Start by adding your first customer lead.</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ContactsListComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  
  contacts$ = this.store.select(selectContacts);
  isLoading$ = this.store.select(selectIsLoading);
  searchControl = new FormControl('', { nonNullable: true });

  isModalOpen = false;
  contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    companyId: [null]
  });

  filteredContacts$ = combineLatest([
    this.contacts$,
    this.searchControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([contacts, search]) => {
      const term = search.toLowerCase();
      if (!term) return contacts;
      return contacts.filter(c => 
        c.fullName.toLowerCase().includes(term) || 
        c.email.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit() {
    this.store.dispatch(CRMActions.loadContacts());
  }

  openCreateModal() { this.isModalOpen = true; }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.contactForm.reset();
  }

  submitContact() {
    if (this.contactForm.valid) {
      this.store.dispatch(CRMActions.createContact({ contact: this.contactForm.value }));
      this.closeCreateModal();
    }
  }

  getStatusClass(status: string): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium ';
    switch (status) {
      case 'LEAD': return base + 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20';
      case 'QUALIFIED': return base + 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'CUSTOMER': return base + 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'CHURNED': return base + 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return base + 'bg-gray-500/10 text-gray-400';
    }
  }
}
