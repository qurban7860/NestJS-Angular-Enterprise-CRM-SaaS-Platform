import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../../core/state/tasks/tasks.actions';
import { selectTasks, selectIsLoading } from '../../../core/state/tasks/tasks.reducer';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { map, startWith, combineLatest, Observable } from 'rxjs';
import { FileUploadComponent } from '../../../core/components/file-upload/file-upload.component';
import { TaskCommentsComponent } from '../../../core/components/task-comments/task-comments.component';
import { ToastActions } from '../../../core/state/toast/toast.actions';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, TaskCommentsComponent, DragDropModule],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
      
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-brand-border rounded-2xl p-6 glass-panel gap-4">
        <div>
          <h1 class="text-2xl font-bold">Tasks Pipeline</h1>
          <p class="text-brand-secondary text-sm mt-1">Track your productivity and team assignments</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button (click)="viewMode = 'LIST'" [class.bg-brand-primary]="viewMode === 'LIST'" [class.text-black]="viewMode === 'LIST'" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> LIST
            </button>
            <button (click)="viewMode = 'BOARD'" [class.bg-brand-primary]="viewMode === 'BOARD'" [class.text-black]="viewMode === 'BOARD'" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">
              <svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg> BOARD
            </button>
          </div>
          <button (click)="openCreateModal()" class="premium-button flex items-center gap-2">
            <span>+</span> New Task
          </button>
        </div>
      </div>

      <div class="glass-panel p-4 rounded-xl flex flex-col lg:flex-row gap-4 items-center justify-between border border-white/5 relative z-20">
        <div class="flex flex-1 flex-wrap gap-3 items-center w-full" [formGroup]="advancedFilters">
          <div class="relative w-full md:w-64">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input formControlName="search" type="text" placeholder="Search tasks..." class="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-brand-primary/50 transition-all">
          </div>
          
          <select formControlName="priority" class="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer">
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select formControlName="assigneeId" class="bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer">
            <option value="">All Assignees</option>
            <option [value]="currentUserId">My Tasks</option>
            @for (user of users$ | async; track user.id) {
              <option [value]="user.id">{{ user.firstName }} {{ user.lastName }}</option>
            }
          </select>
          
          @if (hasActiveFilters) {
            <button (click)="clearFilters()" class="text-xs text-brand-secondary hover:text-white transition-colors">Clear All</button>
          }
        </div>
      </div>

      @if (selectedTasks.size > 0) {
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-brand-primary/50 shadow-[0_10px_40px_rgba(var(--brand-primary-rgb),0.2)] rounded-full px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <span class="text-sm font-bold text-white"><span class="text-brand-primary">{{selectedTasks.size}}</span> Tasks Selected</span>
          <div class="w-px h-6 bg-white/10"></div>
          <button (click)="bulkUpdateStatus('DONE')" class="text-xs font-semibold hover:text-emerald-400 transition-colors flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Mark Done
          </button>
          <button (click)="bulkDelete()" class="text-xs font-semibold hover:text-rose-400 transition-colors flex items-center gap-2 text-rose-500/80">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Delete
          </button>
          <button (click)="clearSelection()" class="text-xs text-brand-secondary ml-4 hover:text-white">Cancel</button>
        </div>
      }

      @if (isLoading$ | async) {
        <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-brand-secondary font-medium animate-pulse">Synchronizing tasks...</p>
        </div>
      } @else {
        
        @if (viewMode === 'BOARD') {
          <div class="flex gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-[600px] items-start" cdkDropListGroup>
            @for (column of boardColumns; track column.id) {
              <div class="flex-shrink-0 w-80 glass-panel bg-black/20 flex flex-col rounded-xl overflow-hidden border border-white/5">
                <div class="p-4 border-b border-white/5 flex justify-between items-center" [style.border-top-color]="column.color" style="border-top-width: 3px;">
                  <h3 class="font-bold text-sm tracking-wide uppercase">{{ column.title }}</h3>
                  <span class="bg-white/10 text-xs px-2 py-0.5 rounded-full font-medium">{{ getTasksByStatus(column.id).length }}</span>
                </div>
                
                <div 
                  cdkDropList 
                  [cdkDropListData]="getTasksByStatus(column.id)" 
                  (cdkDropListDropped)="onDrop($event, column.id)"
                  class="flex-1 p-3 space-y-3 min-h-[150px] custom-scrollbar overflow-y-auto"
                >
                  @for (task of getTasksByStatus(column.id); track task.id) {
                    <div cdkDrag class="glass-panel p-4 rounded-lg border border-white/10 hover:border-brand-primary/40 cursor-grab active:cursor-grabbing bg-[#121212] group relative shadow-lg">
                      
                      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" [class.opacity-100]="selectedTasks.has(task.id)">
                        <input type="checkbox" [checked]="selectedTasks.has(task.id)" (change)="toggleTaskSelection(task.id, $event)" class="w-4 h-4 rounded bg-black/50 border-white/20 accent-brand-primary cursor-pointer">
                      </div>

                      <div class="flex flex-col gap-2" (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)">
                        <div class="flex items-center gap-2 pr-6">
                           <span [class]="getPriorityClass(task.priority)" class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                             {{ task.priority }}
                           </span>
                        </div>
                        <h4 class="font-semibold text-sm leading-tight group-hover:text-brand-primary transition-colors">{{ task.title }}</h4>
                        
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <div class="flex items-center gap-2 text-xs text-brand-secondary">
                            @if (task.dueDate) {
                              <span [class]="getDueDateClass(task.dueDate)" class="flex items-center gap-1 rounded bg-transparent p-0 text-[10px]">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                {{ task.dueDate | date:'MMM d' }}
                              </span>
                            }
                          </div>
                          @if (task.assigneeId) {
                            <div class="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold text-brand-primary border border-brand-primary/30" title="Assigned">
                              {{ getAssigneeInitials(task.assigneeId) }}
                            </div>
                          }
                        </div>
                      </div>

                      @if (selectedTaskId === task.id) {
                        <div class="mt-4 pt-4 border-t border-white/10 space-y-4 cursor-default" (click)="$event.stopPropagation()">
                          <app-file-upload [relatedEntityType]="'TASK'" [relatedEntityId]="task.id" (uploadSuccess)="onUploadSuccess($event)"></app-file-upload>
                          <app-task-comments [taskId]="task.id"></app-task-comments>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        } 
        @else {
          <div class="space-y-3">
            @for (task of filteredTasks; track task.id) {
              <div class="flex flex-col gap-2 group">
                <div class="glass-panel p-4 flex items-center gap-5 group hover:border-brand-primary/30 transition-all border-l-4 relative overflow-hidden"
                  [style.border-left-color]="getPriorityColor(task.priority)"
                  [class.border-brand-primary]="selectedTaskId === task.id">
                  
                  <div class="flex-shrink-0 z-10">
                    <input type="checkbox" [checked]="selectedTasks.has(task.id)" (change)="toggleTaskSelection(task.id, $event)"
                      class="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer accent-brand-primary">
                  </div>

                  <div class="flex-1 min-w-0 z-10 cursor-pointer" (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)">
                    <div class="flex items-center gap-3">
                      <h4 [class.line-through]="task.status === 'DONE'" [class.opacity-40]="task.status === 'DONE'" class="font-semibold text-[15px] truncate transition-all">
                        {{ task.title }}
                      </h4>
                      <span [class]="getPriorityClass(task.priority)" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">{{ task.priority }}</span>
                      <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-white/10 border border-white/5">{{ task.status.replace('_', ' ') }}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5">
                      @if (task.dueDate) {
                        <span class="text-[11px] font-medium flex items-center gap-1" [class]="getDueDateClass(task.dueDate)">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Due {{ task.dueDate | date:'MMM d, yyyy' }}
                        </span>
                      }
                      @if (task.assigneeId) {
                        <div class="flex items-center gap-1.5 text-[11px] text-brand-secondary">
                          <div class="w-4 h-4 rounded-full bg-brand-primary/20 flex items-center justify-center text-[8px] font-bold text-brand-primary">{{ getAssigneeInitials(task.assigneeId) }}</div>
                          Assigned
                        </div>
                      }
                    </div>
                  </div>
                </div>

                @if (selectedTaskId === task.id) {
                  <div class="glass-panel mx-4 p-4 border-t-0 rounded-t-none animate-in slide-in-from-top-2 duration-300 space-y-6">
                    <div>
                      <h5 class="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">Attachments</h5>
                      <app-file-upload [relatedEntityType]="'TASK'" [relatedEntityId]="task.id" (uploadSuccess)="onUploadSuccess($event)"></app-file-upload>
                    </div>
                    <div class="pt-4 border-t border-white/5">
                      <h5 class="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">Activity</h5>
                      <app-task-comments [taskId]="task.id"></app-task-comments>
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <div class="glass-panel p-20 text-center flex flex-col items-center opacity-40 rounded-xl border-dashed border-2 border-white/10">
                 <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                 <h3 class="text-xl font-bold">No tasks match your filters</h3>
                 <p class="text-sm mt-2">Try adjusting your search criteria or create a new task.</p>
                 <button (click)="clearFilters()" class="mt-4 px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-all">Clear Filters</button>
              </div>
            }
          </div>
        }
      }
    </div>

    @if (isModalOpen) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200 p-4">
        <div class="glass-panel w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/10">
          <button (click)="closeCreateModal()" class="absolute top-6 right-6 text-brand-secondary hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div class="mb-6">
            <h2 class="text-xl font-bold">New Task</h2>
          </div>
          <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="space-y-5">
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Task Title</label>
                <input formControlName="title" type="text" placeholder="e.g., Follow up on Q2 proposal" 
                       class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all">
              </div>

              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Description</label>
                <textarea formControlName="description" rows="3" placeholder="Add context..." 
                          class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Priority Level</label>
                  <select formControlName="priority" 
                    class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="LOW" class="bg-[#0a0a0a]">Low</option>
                      <option value="MEDIUM" class="bg-[#0a0a0a]">Medium</option>
                      <option value="HIGH" class="bg-[#0a0a0a]">High</option>
                      <option value="URGENT" class="bg-[#0a0a0a]">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Due Date</label>
                  <input formControlName="dueDate" type="date" 
                  class="cursor-pointer w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all [color-scheme:dark]">
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Assign To</label>
                <select formControlName="assigneeId" class="cursor-pointer w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all appearance-none">
                  <option value="" class="bg-[#0a0a0a]">Unassigned</option>
                  @for (user of users$ | async; track user.id) {
                    <option [value]="user.id" class="bg-[#0a0a0a]">{{ user.firstName }} {{ user.lastName }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Link Contact</label>
                  <select formControlName="contactId" class="cursor-pointer w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all appearance-none">
                    <option value="" class="bg-[#0a0a0a]">None</option>
                    @for (c of contacts$ | async; track c.id) {
                      <option [value]="c.id" class="bg-[#0a0a0a]">{{ c.firstName }} {{ c.lastName }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Link Deal</label>
                  <select formControlName="dealId" class="cursor-pointer w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all appearance-none">
                    <option value="" class="bg-[#0a0a0a]">None</option>
                    @for (d of deals$ | async; track d.id) {
                      <option [value]="d.id" class="bg-[#0a0a0a]">{{ d.title }}</option>
                    }
                  </select>
                </div>
              </div>
            </div>

            <div class="pt-6 flex gap-3">
              <button type="button" (click)="closeCreateModal()" 
                      class="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="taskForm.invalid" 
                      class="premium-button flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TasksListComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private crmService = inject(CrmService);
  private authService = inject(AuthService);
  
  // Data Streams
  tasks$ = this.store.select(selectTasks);
  isLoading$ = this.store.select(selectIsLoading);
  users$: Observable<any[]> = this.authService.getUsers();
  contacts$: Observable<any[]> = this.crmService.getContacts();
  deals$: Observable<any[]> = this.crmService.getDeals();

  // State Management
  viewMode: 'LIST' | 'BOARD' = 'BOARD';
  selectedTaskId: string | null = null;
  isModalOpen = false;
  currentUserId: string | null = null;
  
  // Bulk Actions State
  selectedTasks = new Set<string>();

  // Advanced Filtering Form
  advancedFilters: FormGroup = this.fb.group({
    search: [''],
    priority: [''],
    assigneeId: [''],
    status: ['']
  });

  // Local filtered data cache for synchronous operations (drag drop, templates)
  filteredTasks: any[] = [];

  // Kanban Definitions
  boardColumns = [
    { id: 'TODO', title: 'To Do', color: '#94a3b8' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
    { id: 'REVIEW', title: 'In Review', color: '#f59e0b' },
    { id: 'DONE', title: 'Done', color: '#10b981' }
  ];

  // Task Creation Form
  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM', Validators.required],
    status: ['TODO', Validators.required],
    assigneeId: [''],
    contactId: [''],
    dealId: [''],
    dueDate: ['']
  });

  get hasActiveFilters(): boolean {
    const vals = this.advancedFilters.value;
    return !!vals.search || !!vals.priority || !!vals.assigneeId || !!vals.status;
  }

  ngOnInit() {
    this.authService.getProfile().subscribe(user => {
      this.currentUserId = user.id;
      this.store.dispatch(TasksActions.loadTasks({ filters: {} }));
    });

    // Reactive Pipeline for Filtering
    combineLatest([
      this.tasks$,
      this.advancedFilters.valueChanges.pipe(startWith(this.advancedFilters.value))
    ]).pipe(
      map(([tasks, filters]) => {
        return tasks.filter(t => {
          const matchSearch = filters.search ? t.title.toLowerCase().includes(filters.search.toLowerCase()) : true;
          const matchPriority = filters.priority ? t.priority === filters.priority : true;
          const matchAssignee = filters.assigneeId ? t.assigneeId === filters.assigneeId : true;
          const matchStatus = filters.status ? t.status === filters.status : true;
          return matchSearch && matchPriority && matchAssignee && matchStatus;
        });
      })
    ).subscribe(filtered => {
      // Create fresh copies of objects to prevent CDK strictly modifying ReadOnly NgRx state arrays
      this.filteredTasks = [...filtered];
    });
  }

  // Kanban Helper
  getTasksByStatus(status: string): any[] {
    return this.filteredTasks.filter(t => (t.status || 'TODO') === status);
  }

  // --- DRAG AND DROP LOGIC ---
  onDrop(event: CdkDragDrop<any[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      // Optional: Dispatch ordering action if your API supports indexing
    } else {
      // Moving to a different column
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      const task = event.container.data[event.currentIndex];
      
      // Dispatch NgRx action for API synchronization
      this.store.dispatch(TasksActions.updateTaskStatus({ 
        taskId: task.id, 
        status: newStatus 
      }));
    }
  }

  // --- BULK ACTIONS LOGIC ---
  toggleTaskSelection(taskId: string, event: Event) {
    event.stopPropagation();
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedTasks.add(taskId);
    } else {
      this.selectedTasks.delete(taskId);
    }
  }

  clearSelection() {
    this.selectedTasks.clear();
  }

  bulkUpdateStatus(status: string) {
    const taskIds = Array.from(this.selectedTasks);
    // Ideally map to a bulk action inside NgRx. Fallback is dispatching individually
    taskIds.forEach(id => {
      this.store.dispatch(TasksActions.updateTaskStatus({ taskId: id, status }));
    });
    this.clearSelection();
    this.store.dispatch(ToastActions.showToast({ message: `Updated ${taskIds.length} tasks`, toastType: 'success' }));
  }

  bulkDelete() {
    if (confirm(`Are you sure you want to delete ${this.selectedTasks.size} tasks?`)) {
      const taskIds = Array.from(this.selectedTasks);
      taskIds.forEach(id => {
        // Assuming delete action exists
        // this.store.dispatch(TasksActions.deleteTask({ taskId: id }));
      });
      this.clearSelection();
      this.store.dispatch(ToastActions.showToast({ message: `Tasks deleted`, toastType: 'success' }));
    }
  }

  // --- FILTERING ---
  clearFilters() {
    this.advancedFilters.reset({ search: '', priority: '', assigneeId: '', status: '' });
  }

  // --- UTILS & HELPERS ---
  getDueDateClass(date: any): string {
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) return 'text-rose-400';
    return 'text-brand-primary';
  }

  getAssigneeInitials(userId: string): string { return 'U'; }

  openCreateModal() { this.isModalOpen = true; }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.taskForm.reset({ priority: 'MEDIUM', status: 'TODO', assigneeId: '', contactId: '', dealId: '', dueDate: '' });
  }

  submitTask() {
    if (this.taskForm.valid) {
      const taskData: any = { ...this.taskForm.getRawValue() };
      if (taskData.dueDate) taskData.dueDate = new Date(taskData.dueDate).toISOString();
      ['assigneeId', 'contactId', 'dealId', 'dueDate'].forEach(f => { if (!taskData[f]) taskData[f] = null; });
      this.store.dispatch(TasksActions.createTask({ task: taskData }));
      this.closeCreateModal();
    }
  }

  onUploadSuccess(response: any) {
    this.store.dispatch(ToastActions.showToast({ message: `File attached`, toastType: 'success' }));
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';  
      case 'MEDIUM': return '#3b82f6';
      case 'LOW': return '#94a3b8';   
      default: return '#94a3b8';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'LOW': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  }
}