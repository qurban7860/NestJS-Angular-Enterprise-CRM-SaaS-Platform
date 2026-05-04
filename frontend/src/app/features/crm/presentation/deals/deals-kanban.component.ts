import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonComponent } from '../../../../core/components/button/button.component';
import { CRMActions } from '../../../../core/state/crm/crm.actions';
import { selectDeals, selectIsLoading } from '../../../../core/state/crm/crm.reducer';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { map } from 'rxjs';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { selectStats } from '../../../../core/state/dashboard/dashboard.reducer';
import { DashboardActions } from '../../../../core/state/dashboard/dashboard.actions';
import { combineLatest, take, Observable, of, debounceTime, distinctUntilChanged, switchMap, tap, filter } from 'rxjs';
import { HasPermissionDirective } from '../../../../core/directives/has-permission.directive';
import { CrmService } from '../../../../core/services/crm.service';
import { ActivatedRoute } from '@angular/router';

interface KanbanColumn {
  id: string;
  name: string;
  deals: any[];
}

@Component({
  selector: 'app-deals-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule, ButtonComponent, ConfirmModalComponent, HasPermissionDirective],
  template: `
    <div class="h-full flex flex-col space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/5 border border-white/10 p-4 sm:p-6 rounded-2xl glass-panel">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Sales Pipeline</h1>
          <p class="text-brand-secondary text-xs sm:text-sm mt-1">Track and manage your value-based deals</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div class="bg-white/5 border border-brand-border rounded-xl px-3 sm:px-4 py-2 flex items-center gap-2 flex-1 sm:flex-none justify-center">
            <span class="text-brand-secondary text-[10px] sm:text-sm uppercase tracking-wider font-medium">Pipeline:</span>
            <span class="font-bold text-brand-primary text-sm sm:text-base cursor-default whitespace-nowrap" *ngIf="totalValue$ | async as total">
               {{ total | currency:'USD':'symbol':'1.0-0' }}
            </span>
          </div>
          <button (click)="exportDeals()" class="premium-button !bg-brand-secondary hover:!bg-brand-secondary/80 flex items-center gap-2 text-xs sm:text-sm px-3 py-2 flex-1 sm:flex-none justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span class="hidden sm:inline">Export</span>
          </button>
          <button *hasPermission="'deals:write'" (click)="openCreateModal()" class="premium-button flex items-center gap-2 text-xs sm:text-sm px-4 py-2 flex-1 sm:flex-none justify-center">
            <span>+</span> <span class="hidden sm:inline">New Deal</span>
          </button>
        </div>
      </div>



      <!-- Kanban Board -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden -mx-4 sm:mx-0 px-4 sm:px-0">
        <div class="flex h-full gap-4 sm:gap-6 min-w-max pb-4">
          @for (column of columns$ | async; track column.id) {
            <div class="w-72 sm:w-80 flex flex-col h-full bg-black/10 rounded-2xl border border-white/5 overflow-hidden">
              <!-- Column Header -->
              <div class="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                <h3 class="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-brand-secondary flex items-center gap-2">
                  {{ column.name }}
                  <span class="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">{{ column.deals.length }}</span>
                </h3>
                <button class="text-brand-secondary hover:text-white transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
              </div>

              <!-- Column List (Droppable) -->
              <div
                [id]="column.id"
                cdkDropList
                [cdkDropListData]="column.deals"
                [cdkDropListConnectedTo]="stageIds"
                (cdkDropListDropped)="onDrop($event)"
                class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 custom-scrollbar"
              >
                @for (deal of column.deals; track deal.id) {
                  <div 
                    cdkDrag
                    class="glass-panel p-4 cursor-grab active:cursor-grabbing hover:border-brand-primary/40 transition-all group border-l-4 relative bg-brand-dark/40 shadow-sm"
                    [style.border-left-color]="getPriorityColor(deal.valueAmount)"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-bold text-xs sm:text-sm group-hover:text-brand-primary transition-colors cursor-pointer pr-8 leading-relaxed">
                        {{ deal.title }}
                      </h4>
                      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <ng-container *hasPermission="'deals:write'">
                          <button (click)="editDeal(deal)" class="p-1.5 text-brand-secondary hover:text-white bg-black/60 rounded-lg backdrop-blur-md">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                          </button>
                        </ng-container>
                        <ng-container *hasPermission="'deals:delete'">
                          <button (click)="deleteDeal(deal)" class="p-1.5 text-brand-secondary hover:text-red-400 bg-black/60 rounded-lg backdrop-blur-md">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </ng-container>
                      </div>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                      <div class="flex flex-col">
                        <span class="text-brand-primary font-black text-sm">
                          {{ deal.valueAmount | currency:deal.valueCurrency:'symbol':'1.0-0' }}
                        </span>
                        @if (deal.probability) {
                          <span class="text-[10px] text-brand-secondary font-bold">{{ deal.probability }}% Probability</span>
                        }
                      </div>
                      <div class="flex -space-x-2">
                        <div class="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {{ deal.ownerId ? 'U' : '?' }}
                        </div>
                      </div>
                    </div>

                    @if (deal.contact) {
                      <div class="mt-2 flex items-center gap-1.5 text-[10px] text-brand-secondary font-medium">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span class="truncate">{{ deal.contact.firstName }} {{ deal.contact.lastName }}</span>
                      </div>
                    }

                    <div class="mt-4 pt-3 flex items-center justify-between border-t border-white/5 opacity-40 text-[9px] uppercase tracking-tighter font-bold">
                      <span>#{{ deal.id.substring(0,4) }}</span>
                      <span>{{ deal.createdAt | date:'MMM d' }}</span>
                    </div>

                    <!-- Drag Preview Placeholder -->
                    <div *cdkDragPlaceholder class="bg-brand-primary/5 border-2 border-dashed border-brand-primary/20 rounded-2xl h-32 w-full"></div>
                  </div>
                } @empty {
                   <div class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                     <span class="text-[10px] uppercase font-bold tracking-widest">No deals</span>
                   </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Create Deal Modal Overlay -->
    @if (isModalOpen) {
      <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[100] flex items-center justify-center animate-in fade-in duration-200 p-2 sm:p-4 overflow-y-auto">
        <div class="glass-panel w-full max-w-lg p-4 sm:p-8 relative my-auto shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
          <button (click)="closeCreateModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h2 class="text-lg sm:text-2xl font-black italic uppercase tracking-tighter mb-6">{{ editingDealId ? 'Update' : 'Initiate' }} <span class="text-brand-primary">Deal</span></h2>
          <form [formGroup]="dealForm" (ngSubmit)="submitDeal()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-1">Deal Title</label>
              <input formControlName="title" type="text" class="input-field" placeholder="Enter the deal title">
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-1">Value Amount</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <input formControlName="valueAmount" type="number" class="input-field" placeholder="0.00">
                 <div class="relative">
                    <input formControlName="probability" type="number" min="0" max="100" class="input-field" placeholder="Win %">
                    <span class="absolute right-3 top-2.5 text-brand-secondary text-xs">%</span>
                 </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-1">Associate Contact</label>
              <div class="relative">
                 <input [formControl]="contactSearchControl" type="text" class="input-field" placeholder="Search contacts...">
                 <svg class="w-4 h-4 absolute right-3 top-3 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 
                 @if (contactSearchResults$ | async; as results) {
                   @if (results.length > 0 && showContactResults) {
                     <div class="absolute top-full left-0 right-0 mt-2 glass-panel z-[120] border border-white/10 max-h-56 overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl bg-[#1a1a1e]">
                       @for (c of results; track c.id) {
                         <div (click)="selectContact(c)" class="p-3 hover:bg-white/10 cursor-pointer flex items-center justify-between group">
                           <div>
                             <p class="text-xs font-bold text-white group-hover:text-brand-primary transition-colors">{{ c.fullName }}</p>
                             <p class="text-[10px] text-brand-secondary">{{ c.email }}</p>
                           </div>
                           <span class="text-[10px] text-brand-primary opacity-0 group-hover:opacity-100 uppercase font-black">Select</span>
                         </div>
                       }
                     </div>
                   }
                 }
              </div>
              @if (dealForm.get('contactId')?.value) {
                <div class="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <span class="text-xs font-medium">{{ selectedContact?.fullName }}</span>
                  <button type="button" (click)="clearContact()" class="text-brand-secondary hover:text-red-400">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              }
            </div>

            <div class="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Pipeline Stage</label>
                <select formControlName="stage" class="custom-select">
                  <option value="PROSPECTING">Prospecting</option>
                  <option value="QUALIFICATION">Qualification</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="CLOSED_WON">Closed Won</option>
                  <option value="CLOSED_LOST">Closed Lost</option>
                </select>
              </div>
            </div>
            <app-button
              type="submit"
              [disabled]="dealForm.invalid"
              variant="premium"
              customClass="w-full mt-6 py-3 justify-center cursor-pointer"
              >{{ editingDealId ? 'Update Deal' : 'Initialize Deal' }}</app-button
            >
          </form>
        </div>
      </div>
    }

    @if (isConfirmModalOpen) {
      <app-confirm-modal
        title="Delete Deal"
        [message]="'Are you sure you want to delete deal ' + dealToDelete?.title + '?'"
        confirmText="Delete"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
      ></app-confirm-modal>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
  `]
})
export class DealsKanbanComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  private crmService = inject(CrmService);
  private route = inject(ActivatedRoute);
  
  deals$ = this.store.select(selectDeals);
  stats$ = this.store.select(selectStats);
  isLoading$ = this.store.select(selectIsLoading);

  isModalOpen = false;
  isConfirmModalOpen = false;
  dealToDelete: any = null;
  editingDealId: string | null = null;
  
  // Contact Search
  contactSearchControl = new FormControl('');
  contactSearchResults$: Observable<any[]> = of([]);
  selectedContact: any = null;
  showContactResults = false;

  dealForm = this.fb.group({
    title: ['', Validators.required],
    valueAmount: [0, [Validators.required, Validators.min(0)]],
    valueCurrency: ['USD', Validators.required],
    stage: ['PROSPECTING', Validators.required],
    probability: [0, [Validators.min(0), Validators.max(100)]],
    expectedCloseDate: [null as string | null],
    contactId: [null as string | null],
    companyId: [null as string | null]
  });

  stageIds = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
  
  columns$ = this.deals$.pipe(
    map(deals => [
      { id: 'PROSPECTING', name: 'Prospecting', deals: deals.filter(d => this.getDealStage(d) === 'PROSPECTING') },
      { id: 'QUALIFICATION', name: 'Qualification', deals: deals.filter(d => this.getDealStage(d) === 'QUALIFICATION') },
      { id: 'PROPOSAL', name: 'Proposal', deals: deals.filter(d => this.getDealStage(d) === 'PROPOSAL') },
      { id: 'NEGOTIATION', name: 'Negotiation', deals: deals.filter(d => this.getDealStage(d) === 'NEGOTIATION') },
      { id: 'CLOSED_WON', name: 'Closed', deals: deals.filter(d => this.getDealStage(d) === 'CLOSED_WON') }
    ])
  );

  totalValue$ = this.deals$.pipe(
    map(deals => deals.reduce((acc, d) => acc + Number(d.valueAmount), 0))
  );

  ngOnInit() {
    this.store.dispatch(CRMActions.loadDeals());
    this.store.dispatch(DashboardActions.loadStats());

    // Handle direct navigation to a deal from global search
    this.route.queryParams.pipe(take(1)).subscribe((params: any) => {
      if (params['id']) {
        this.deals$.pipe(
          filter((deals: any[]) => deals.length > 0),
          take(1)
        ).subscribe((deals: any[]) => {
          const deal = deals.find((d: any) => d.id === params['id']);
          if (deal) {
            this.editDeal(deal);
          }
        });
      }
    });

    this.contactSearchResults$ = this.contactSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query: string | null) => {
        if (!query || typeof query !== 'string' || query.length < 2) return of([]);
        return this.crmService.searchContacts(query);
      }),
      tap(() => this.showContactResults = true)
    );
  }

  selectContact(contact: any) {
    this.selectedContact = contact;
    this.dealForm.patchValue({ contactId: contact.id });
    this.showContactResults = false;
    this.contactSearchControl.setValue(contact.fullName, { emitEvent: false });
  }

  clearContact() {
    this.selectedContact = null;
    this.dealForm.patchValue({ contactId: null });
    this.contactSearchControl.setValue('');
  }

  openCreateModal() { 
    (combineLatest([this.subService.limits$, this.stats$]).pipe(take(1)) as Observable<any>).subscribe((data: any) => {
      const [limits, stats] = data;
      if (stats.totalDealsCount >= limits.maxDeals) {
        this.store.dispatch({ 
          type: '[Toast] Show Toast', 
          id: 'limit-reached', 
          message: `Deal limit reached (${limits.maxDeals}). Please upgrade your plan to add more.`, 
          toastType: 'warning' 
        });
        return;
      }
      this.editingDealId = null;
      this.selectedContact = null;
      this.contactSearchControl.setValue('');
      this.dealForm.reset({ valueCurrency: 'USD', stage: 'PROSPECTING', probability: 0 });
      this.isModalOpen = true; 
    });
  }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.editingDealId = null;
    this.selectedContact = null;
    this.contactSearchControl.setValue('');
    this.dealForm.reset({ valueCurrency: 'USD', stage: 'PROSPECTING', probability: 0 });
  }

  submitDeal() {
    if (this.dealForm.valid) { 
      const formValue = this.dealForm.value;
      if (this.editingDealId) {
        this.store.dispatch(CRMActions.updateDeal({ id: this.editingDealId, deal: formValue }));
      } else {
        this.store.dispatch(CRMActions.createDeal({ deal: formValue }));
      }
      this.closeCreateModal();
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const deal = event.previousContainer.data[event.previousIndex];
      const newStage = event.container.id;
      const originalStage = event.previousContainer.id;
      
      // OPTIMISTIC UPDATE: Dispatch immediately
      this.store.dispatch(CRMActions.updateDealStage({ id: deal.id, stage: newStage }));
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getPriorityColor(value: number): string {
    if (value > 50000) return '#fbbf24'; // High Value Gold
    if (value > 10000) return '#60a5fa'; // Mid Value Blue
    return '#94a3b8'; // Low Value Gray
  }

  // columnSettings(columnId: string) {
  //   alert(`Manage settings for ${columnId} stage`);
  // }

  editDeal(deal: any) {
    this.editingDealId = deal.id;
    this.dealForm.patchValue({
      title: deal.title,
      valueAmount: deal.valueAmount,
      valueCurrency: deal.valueCurrency,
      stage: this.getDealStage(deal),
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : null,
      contactId: deal.contactId,
      companyId: deal.companyId
    });
    
    if (deal.contactId) {
      this.selectedContact = deal.contact ? { ...deal.contact, fullName: deal.contact.fullName || `${deal.contact.firstName} ${deal.contact.lastName}` } : { id: deal.contactId, fullName: 'Linked Contact' };
      this.contactSearchControl.setValue(this.selectedContact.fullName, { emitEvent: false });
    }

    this.isModalOpen = true;
  }

  deleteDeal(deal: any) {
    this.dealToDelete = deal;
    this.isConfirmModalOpen = true;
  }

  confirmDelete() {
    if (this.dealToDelete) {
      this.store.dispatch(CRMActions.deleteDeal({ id: this.dealToDelete.id }));
      this.dealToDelete = null;
    }
    this.isConfirmModalOpen = false;
  }

  cancelDelete() {
    this.isConfirmModalOpen = false;
    this.dealToDelete = null;
  }

  exportDeals() {
    this.store.dispatch(CRMActions.exportDeals());
  }

  private getDealStage(deal: any): string {
    const rawStage = deal?.stage ?? deal?.stageId ?? 'PROSPECTING';
    const normalizedStage = String(rawStage).toUpperCase();

    if (normalizedStage === 'CONTACT_MADE' || normalizedStage === 'NEEDS_DEFINED') {
      return 'QUALIFICATION';
    }

    if (normalizedStage === 'PROPOSAL_MADE') {
      return 'PROPOSAL';
    }

    if (normalizedStage === 'NEGOTIATIONS') {
      return 'NEGOTIATION';
    }

    if (normalizedStage === 'WON' || normalizedStage === 'CLOSED') {
      return 'CLOSED_WON';
    }

    return normalizedStage;
  }
}
