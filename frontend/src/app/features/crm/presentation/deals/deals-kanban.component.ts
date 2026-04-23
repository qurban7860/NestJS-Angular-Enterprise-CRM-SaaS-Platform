import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CRMActions } from '../../../../core/state/crm/crm.actions';
import { selectDeals, selectIsLoading } from '../../../../core/state/crm/crm.reducer';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { map } from 'rxjs';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { selectStats } from '../../../../core/state/dashboard/dashboard.reducer';
import { DashboardActions } from '../../../../core/state/dashboard/dashboard.actions';
import { combineLatest, take, Observable } from 'rxjs';

interface KanbanColumn {
  id: string;
  name: string;
  deals: any[];
}

@Component({
  selector: 'app-deals-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule, ConfirmModalComponent],
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
          <button (click)="openCreateModal()" class="premium-button flex items-center gap-2 text-xs sm:text-sm px-4 py-2 flex-1 sm:flex-none justify-center">
            <span>+</span> <span class="hidden sm:inline">New Deal</span>
          </button>
        </div>
      </div>

      <!-- Create Deal Modal Overlay -->
      @if (isModalOpen) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200 p-4">
          <div class="glass-panel w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button (click)="closeCreateModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-xl sm:text-2xl font-bold mb-6">{{ editingDealId ? 'Edit Deal' : 'Create New Deal' }}</h2>
            <form [formGroup]="dealForm" (ngSubmit)="submitDeal()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Deal Title</label>
                <input formControlName="title" type="text" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200" placeholder="Enter the deal title">
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Value Amount</label>
                <input formControlName="valueAmount" type="number" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200" placeholder="Enter the deal value">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Currency</label>
                  <select formControlName="valueCurrency" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Stage</label>
                  <select formControlName="stage" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200">
                    <option value="PROSPECTING">Prospecting</option>
                    <option value="QUALIFICATION">Qualification</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="dealForm.invalid" class="premium-button w-full mt-6 py-3 disabled:opacity-50 text-sm">{{ editingDealId ? 'Update Pipeline Deal' : 'Create Pipeline Deal' }}</button>
            </form>
          </div>
        </div>
      }

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
                <button (click)="columnSettings(column.id)" class="text-brand-secondary hover:text-white transition-colors">
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
                        <button (click)="editDeal(deal)" class="p-1.5 text-brand-secondary hover:text-white bg-black/60 rounded-lg backdrop-blur-md">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                          </svg>
                        </button>
                        <button (click)="deleteDeal(deal)" class="p-1.5 text-brand-secondary hover:text-red-400 bg-black/60 rounded-lg backdrop-blur-md">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                      <span class="text-brand-primary font-black text-sm">
                        {{ deal.valueAmount | currency:deal.valueCurrency:'symbol':'1.0-0' }}
                      </span>
                      <div class="flex -space-x-2">
                        <div class="w-7 h-7 rounded-full bg-indigo-500/20 border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold text-indigo-400">
                          {{ deal.ownerId ? 'U' : '?' }}
                        </div>
                      </div>
                    </div>

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

      @if (isConfirmModalOpen) {
        <app-confirm-modal
          title="Delete Deal"
          [message]="'Are you sure you want to delete deal ' + dealToDelete?.title + '?'"
          confirmText="Delete"
          (confirm)="confirmDelete()"
          (cancel)="cancelDelete()"
        ></app-confirm-modal>
      }
    </div>
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
  
  deals$ = this.store.select(selectDeals);
  stats$ = this.store.select(selectStats);
  isLoading$ = this.store.select(selectIsLoading);

  isModalOpen = false;
  isConfirmModalOpen = false;
  dealToDelete: any = null;
  editingDealId: string | null = null;
  dealForm = this.fb.group({
    title: ['', Validators.required],
    valueAmount: [0, [Validators.required, Validators.min(0)]],
    valueCurrency: ['USD', Validators.required],
    stage: ['PROSPECTING', Validators.required],
    contactId: ['00000000-0000-0000-0000-000000000000'],
    companyId: ['00000000-0000-0000-0000-000000000000']
  });

  stageIds = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
  
  columns$ = this.deals$.pipe(
    map(deals => [
      { id: 'PROSPECTING', name: 'Prospecting', deals: deals.filter(d => d.stage === 'PROSPECTING') },
      { id: 'QUALIFICATION', name: 'Qualification', deals: deals.filter(d => d.stage === 'QUALIFICATION') },
      { id: 'PROPOSAL', name: 'Proposal', deals: deals.filter(d => d.stage === 'PROPOSAL') },
      { id: 'NEGOTIATION', name: 'Negotiation', deals: deals.filter(d => d.stage === 'NEGOTIATION') },
      { id: 'CLOSED_WON', name: 'Closed', deals: deals.filter(d => d.stage === 'CLOSED_WON') }
    ])
  );

  totalValue$ = this.deals$.pipe(
    map(deals => deals.reduce((acc, d) => acc + Number(d.valueAmount), 0))
  );

  ngOnInit() {
    this.store.dispatch(CRMActions.loadDeals());
    this.store.dispatch(DashboardActions.loadStats());
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
      this.dealForm.reset({ valueCurrency: 'USD', stage: 'PROSPECTING', contactId: '00000000-0000-0000-0000-000000000000', companyId: '00000000-0000-0000-0000-000000000000' });
      this.isModalOpen = true; 
    });
  }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.editingDealId = null;
    this.dealForm.reset({ valueCurrency: 'USD', stage: 'PROSPECTING', contactId: '00000000-0000-0000-0000-000000000000', companyId: '00000000-0000-0000-0000-000000000000' });
  }

  submitDeal() {
    if (this.dealForm.valid) {
      const formValue = this.dealForm.value;
      const payload = {
        ...formValue,
        contactId: formValue.contactId === '00000000-0000-0000-0000-000000000000' ? null : formValue.contactId,
        companyId: formValue.companyId === '00000000-0000-0000-0000-000000000000' ? null : formValue.companyId
      };

      if (this.editingDealId) {
        this.store.dispatch(CRMActions.updateDeal({ id: this.editingDealId, deal: payload }));
      } else {
        this.store.dispatch(CRMActions.createDeal({ deal: payload }));
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

  columnSettings(columnId: string) {
    alert(`Manage settings for ${columnId} stage`);
  }

  editDeal(deal: any) {
    this.editingDealId = deal.id;
    this.dealForm.patchValue({
      title: deal.title,
      valueAmount: deal.valueAmount,
      valueCurrency: deal.valueCurrency,
      stage: deal.stage,
      contactId: deal.contactId || '00000000-0000-0000-0000-000000000000',
      companyId: deal.companyId || '00000000-0000-0000-0000-000000000000'
    });
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
}
