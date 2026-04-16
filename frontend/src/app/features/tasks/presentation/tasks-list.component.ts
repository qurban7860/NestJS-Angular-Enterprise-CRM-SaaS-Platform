import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../../core/state/tasks/tasks.actions';
import { selectTasks, selectIsLoading } from '../../../core/state/tasks/tasks.reducer';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { map, startWith, combineLatest, of, Observable } from 'rxjs';
import { FileUploadComponent } from '../../../core/components/file-upload/file-upload.component';
import { TaskCommentsComponent } from '../../../core/components/task-comments/task-comments.component';
import { ToastActions } from '../../../core/state/toast/toast.actions';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, TaskCommentsComponent],
  template: `
    <div class="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <!-- Header -->
      <div class="flex justify-between items-center bg-white/5 border border-brand-border rounded-2xl p-6 glass-panel">
        <div>
          <h1 class="text-2xl font-bold">Tasks</h1>
          <p class="text-brand-secondary text-sm mt-1">Track your productivity and team assignments</p>
        </div>
        <button (click)="openCreateModal()" class="premium-button flex items-center gap-2">
          <span>+</span> New Task
        </button>
      </div>

      <!-- Create Task Modal Overlay -->
      @if (isModalOpen) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in zoom-in duration-200">
          <div class="glass-panel w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            <button (click)="closeCreateModal()" class="absolute top-6 right-6 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <div class="mb-8">
              <h2 class="text-2xl font-bold">New Task</h2>
              <p class="text-brand-secondary text-sm">Fill in the details to create a new assignment</p>
            </div>

            <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Title</label>
                  <input formControlName="title" type="text" class="premium-input w-full" placeholder="e.g., Follow up on Q2 proposal">
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Description</label>
                  <textarea formControlName="description" rows="2" class="premium-input w-full" placeholder="Add some context..."></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Priority</label>
                    <select formControlName="priority" class="premium-input w-full bg-black">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Due Date</label>
                    <input formControlName="dueDate" type="date" class="premium-input w-full">
                  </div>
                </div>

                <div class="border-t border-white/5 pt-4">
                  <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Assignee</label>
                  <select formControlName="assigneeId" class="premium-input w-full bg-black">
                    <option value="">Unassigned</option>
                    @for (user of users$ | async; track user.id) {
                      <option [value]="user.id">{{ user.firstName }} {{ user.lastName }}</option>
                    }
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Link Contact</label>
                    <select formControlName="contactId" class="premium-input w-full bg-black">
                      <option value="">None</option>
                      @for (c of contacts$ | async; track c.id) {
                        <option [value]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-brand-secondary mb-2">Link Deal</label>
                    <select formControlName="dealId" class="premium-input w-full bg-black">
                      <option value="">None</option>
                      @for (d of deals$ | async; track d.id) {
                        <option [value]="d.id">{{ d.title }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <div class="pt-4 flex gap-3">
                <button type="button" (click)="closeCreateModal()" class="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium">Cancel</button>
                <button type="submit" [disabled]="taskForm.invalid" class="premium-button flex-1 py-3 disabled:opacity-50">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Advanced Filters -->
      <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex flex-1 gap-4 items-center w-full">
          <div class="relative w-full md:w-96">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              [formControl]="searchControl"
              type="text" 
              placeholder="Search by title..." 
              class="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-all">
          </div>
          
          <div class="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              (click)="setFilter('ALL')"
              [class.bg-brand-primary]="currentFilter === 'ALL'"
              [class.text-black]="currentFilter === 'ALL'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            >ALL</button>
            <button 
              (click)="setFilter('MINE')"
              [class.bg-brand-primary]="currentFilter === 'MINE'"
              [class.text-black]="currentFilter === 'MINE'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            >MY TASKS</button>
          </div>
        </div>

        <div class="flex gap-6 text-[11px] font-bold uppercase tracking-widest">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"></span>
            <span class="text-brand-secondary">To Do: {{ (todoCount$ | async) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            <span class="text-brand-secondary">Done: {{ (doneCount$ | async) }}</span>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="space-y-4">
        @if (isLoading$ | async) {
          <div class="flex flex-col items-center justify-center p-20 space-y-4">
             <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
             <p class="text-brand-secondary font-medium animate-pulse">Synchronizing tasks...</p>
          </div>
        } @else {
          @for (task of filteredTasks$ | async; track task.id) {
            <div class="flex flex-col gap-2 group">
              <div 
                (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)"
                class="glass-panel p-5 flex items-center gap-5 group hover:border-brand-primary/30 transition-all border-l-4 cursor-pointer relative overflow-hidden"
                [style.border-left-color]="getPriorityColor(task.priority)"
                [class.border-brand-primary]="selectedTaskId === task.id"
              >
                <!-- Selection State Backdrop -->
                @if (selectedTaskId === task.id) {
                  <div class="absolute inset-0 bg-brand-primary/5 pointer-events-none"></div>
                }

                <div class="flex-shrink-0 z-10">
                  <input 
                    type="checkbox" 
                    [checked]="task.status === 'DONE'"
                    (change)="toggleStatus(task); $event.stopPropagation()"
                    class="w-6 h-6 rounded-lg border-brand-border bg-white/5 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer accent-brand-primary"
                  >
                </div>

                <div class="flex-1 min-w-0 z-10">
                  <div class="flex items-center gap-2">
                    <h4 [class.line-through]="task.status === 'DONE'" [class.opacity-40]="task.status === 'DONE'" class="font-semibold text-lg truncate transition-all">
                      {{ task.title }}
                    </h4>
                    @if (task.dueDate) {
                      <span class="text-[10px] px-2 py-0.5 rounded-md font-bold" [class]="getDueDateClass(task.dueDate)">
                        Due {{ task.dueDate | date:'MMM d' }}
                      </span>
                    }
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span [class]="getPriorityClass(task.priority)" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                      {{ task.priority }}
                    </span>
                    
                    @if (task.assigneeId) {
                      <div class="flex items-center gap-1.5 text-[11px] text-brand-secondary bg-white/5 px-2 py-0.5 rounded-full">
                        <div class="w-4 h-4 rounded-full bg-brand-primary/20 flex items-center justify-center text-[8px] font-bold text-brand-primary">
                          {{ getAssigneeInitials(task.assigneeId) }}
                        </div>
                        Assigned
                      </div>
                    }

                    @if (task.contactId || task.dealId) {
                      <div class="flex items-center gap-3">
                        <span class="text-white/10 text-xs">|</span>
                        @if (task.contactId) {
                          <span class="text-[10px] text-brand-primary/80 hover:underline">Contact Attached</span>
                        }
                        @if (task.dealId) {
                          <span class="text-[10px] text-emerald-400/80 hover:underline">Deal Linked</span>
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="flex flex-col items-end gap-2 z-10">
                   <div class="text-[11px] font-bold text-brand-secondary opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                     DETAILS
                   </div>
                   <div class="flex items-center -space-x-1">
                      @if (task.status === 'DONE') {
                        <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                      }
                   </div>
                </div>
              </div>

              <!-- Quick Attachment Area -->
              @if (selectedTaskId === task.id) {
                <div class="glass-panel mx-4 p-4 border-t-0 rounded-t-none animate-in slide-in-from-top-2 duration-300 space-y-6">
                  <div>
                    <h5 class="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">Task Attachments</h5>
                    <app-file-upload 
                      [relatedEntityType]="'TASK'" 
                      [relatedEntityId]="task.id"
                      (uploadSuccess)="onUploadSuccess($event)"
                    ></app-file-upload>
                  </div>

                  <div class="pt-4 border-t border-white/5">
                    <h5 class="text-xs font-bold uppercase tracking-wider text-brand-secondary mb-3">Comments & Activity</h5>
                    <app-task-comments [taskId]="task.id"></app-task-comments>
                  </div>
                </div>
              }
            </div>
          } @empty {
            <div class="glass-panel p-20 text-center flex flex-col items-center opacity-40">
               <svg class="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
               <h3 class="text-xl font-bold">Inbox Zero!</h3>
               <p class="text-sm">No tasks found. Take a break or create a new one.</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class TasksListComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private crmService = inject(CrmService);
  private authService = inject(AuthService);
  
  tasks$ = this.store.select(selectTasks);
  isLoading$ = this.store.select(selectIsLoading);
  searchControl = new FormControl('', { nonNullable: true });
  
  users$: Observable<any[]> = this.authService.getUsers();
  contacts$: Observable<any[]> = this.crmService.getContacts();
  deals$: Observable<any[]> = this.crmService.getDeals();

  selectedTaskId: string | null = null;
  isModalOpen = false;
  currentFilter: 'ALL' | 'MINE' = 'ALL';
  currentUserId: string | null = null;

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

  filteredTasks$ = combineLatest([
    this.tasks$,
    this.searchControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([tasks, search]) => {
      const term = search.toLowerCase();
      if (!term) return tasks;
      return tasks.filter(t => t.title.toLowerCase().includes(term));
    })
  );

  todoCount$ = this.tasks$.pipe(map(tasks => tasks.filter(t => t.status !== 'DONE').length));
  doneCount$ = this.tasks$.pipe(map(tasks => tasks.filter(t => t.status === 'DONE').length));

  ngOnInit() {
    this.authService.getProfile().subscribe(user => {
      this.currentUserId = user.id;
      this.loadTasks();
    });
  }

  loadTasks() {
    const filters = this.currentFilter === 'MINE' ? { assigneeId: this.currentUserId! } : {};
    this.store.dispatch(TasksActions.loadTasks({ filters }));
  }

  setFilter(filter: 'ALL' | 'MINE') {
    this.currentFilter = filter;
    this.loadTasks();
  }

  getDueDateClass(date: any): string {
    const dueDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return 'bg-rose-500/10 text-rose-400';
    return 'bg-brand-primary/10 text-brand-primary';
  }

  getAssigneeInitials(userId: string): string {
    // Ideally we would map this from users$, but for now we'll just show 'U' 
    // or fetch initials if we had them in the task object.
    return 'U'; 
  }

  openCreateModal() { this.isModalOpen = true; }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.taskForm.reset({ 
      priority: 'MEDIUM', 
      status: 'TODO',
      assigneeId: '',
      contactId: '',
      dealId: '',
      dueDate: ''
    });
  }

  submitTask() {
    if (this.taskForm.valid) {
      const taskData: any = { ...this.taskForm.getRawValue() };
      // Clean up empty strings to null for backend
      ['assigneeId', 'contactId', 'dealId', 'dueDate'].forEach(field => {
        if (!taskData[field]) taskData[field] = null;
      });

      this.store.dispatch(TasksActions.createTask({ task: taskData }));
      this.closeCreateModal();
    }
  }

  onUploadSuccess(response: any) {
    this.store.dispatch(ToastActions.showToast({
      message: `File "${response.originalName}" attached successfully`,
      toastType: 'success'
    }));
  }

  toggleStatus(task: any) {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    this.store.dispatch(TasksActions.updateTaskStatus({ 
      taskId: task.id, 
      status: newStatus 
    }));
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return '#ef4444'; // Red
      case 'HIGH': return '#f97316';   // Orange
      case 'MEDIUM': return '#3b82f6'; // Blue
      case 'LOW': return '#94a3b8';    // Slate
      default: return '#94a3b8';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-500';
      case 'HIGH': return 'bg-orange-500/10 text-orange-500';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-500';
      case 'LOW': return 'bg-slate-500/10 text-slate-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  }
}
