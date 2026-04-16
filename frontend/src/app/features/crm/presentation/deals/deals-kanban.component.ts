import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { CRMActions } from '../../../../core/state/crm/crm.actions';
import { selectDeals, selectIsLoading } from '../../../../core/state/crm/crm.reducer';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { map } from 'rxjs';

interface KanbanColumn {
  id: string;
  name: string;
  deals: any[];
}

@Component({
  selector: 'app-deals-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule],
  template: `
    <div class="h-[calc(100vh-12rem)] flex flex-col space-y-6 animate-in fade-in duration-500">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Sales Pipeline</h1>
          <p class="text-brand-secondary text-sm mt-1">Track and manage your value-based deals</p>
        </div>
        <div class="flex gap-3">
          <div class="bg-white/5 border border-brand-border rounded-xl px-4 py-2 flex items-center gap-2">
            <span class="text-brand-secondary text-sm">Total Value:</span>
            <span class="font-bold text-brand-primary cursor-default" *ngIf="totalValue$ | async as total">
               {{ total | currency:'USD':'symbol':'1.0-0' }}
            </span>
          </div>
          <button (click)="openCreateModal()" class="premium-button flex items-center gap-2">
            <span>+</span> New Deal
          </button>
        </div>
      </div>

      <!-- Create Deal Modal Overlay -->
      @if (isModalOpen) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div class="glass-panel w-full max-w-md p-8 relative">
            <button (click)="closeCreateModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-2xl font-bold mb-6">Create New Deal</h2>
            <form [formGroup]="dealForm" (ngSubmit)="submitDeal()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Deal Title</label>
                <input formControlName="title" type="text" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="E.g. Enterprise License">
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Value Amount</label>
                <input formControlName="valueAmount" type="number" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="50000">
              </div>
              <div class="flex gap-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Currency</label>
                  <select formControlName="valueCurrency" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all text-white">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Stage</label>
                  <select formControlName="stage" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all text-white">
                    <option value="PROSPECTING">Prospecting</option>
                    <option value="QUALIFICATION">Qualification</option>
                    <option value="PROPOSAL">Proposal</option>
                    <option value="NEGOTIATION">Negotiation</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="dealForm.invalid" class="premium-button w-full mt-6 py-3 disabled:opacity-50">Create Pipeline Deal</button>
            </form>
          </div>
        </div>
      }

      <!-- Kanban Board -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden">
        <div class="flex h-full gap-6 min-w-max pb-4">
          @for (column of columns$ | async; track column.id) {
            <div class="w-80 flex flex-col h-full">
              <!-- Column Header -->
              <div class="flex justify-between items-center mb-4 px-2">
                <h3 class="font-semibold text-sm uppercase tracking-wider text-brand-secondary">
                  {{ column.name }}
                  <span class="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">{{ column.deals.length }}</span>
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
                class="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar"
              >
                @for (deal of column.deals; track deal.id) {
                  <div 
                    cdkDrag
                    class="glass-panel p-4 cursor-grab active:cursor-grabbing hover:border-brand-primary/30 transition-all group border-l-4"
                    [style.border-left-color]="getPriorityColor(deal.valueAmount)"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-medium text-sm group-hover:text-brand-primary transition-colors cursor-pointer">
                        {{ deal.title }}
                      </h4>
                    </div>
                    
                    <div class="flex justify-between items-center mt-4">
                      <span class="text-brand-primary font-bold text-sm">
                        {{ deal.valueAmount | currency:deal.valueCurrency:'symbol':'1.0-0' }}
                      </span>
                      <div class="flex -space-x-2">
                        <div class="w-6 h-6 rounded-full bg-brand-primary/20 border border-brand-border flex items-center justify-center text-[10px] font-bold">
                          {{ deal.ownerId ? 'U' : '?' }}
                        </div>
                      </div>
                    </div>

                    <div class="mt-3 flex items-center justify-between opacity-50 text-[10px] uppercase tracking-tighter">
                      <span>Ref: #{{ deal.id.substring(0,4) }}</span>
                      <span>{{ deal.createdAt | date:'MMM d' }}</span>
                    </div>

                    <!-- Drag Preview Placeholder -->
                    <div *cdkDragPlaceholder class="bg-brand-primary/10 border-2 border-dashed border-brand-primary/30 rounded-2xl h-32 w-full"></div>
                  </div>
                } @empty {
                   <div class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-brand-border rounded-2xl opacity-30">
                     <span class="text-xs">No deals here</span>
                   </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
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
  
  deals$ = this.store.select(selectDeals);
  isLoading$ = this.store.select(selectIsLoading);

  isModalOpen = false;
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
  }

  openCreateModal() { this.isModalOpen = true; }
  closeCreateModal() { 
    this.isModalOpen = false;
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

      this.store.dispatch(CRMActions.createDeal({ deal: payload }));
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
}
