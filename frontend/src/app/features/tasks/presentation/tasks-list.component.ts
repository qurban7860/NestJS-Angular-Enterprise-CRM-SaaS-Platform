import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../../core/state/tasks/tasks.actions';
import { selectTasks, selectIsLoading } from '../../../core/state/tasks/tasks.reducer';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { map, startWith, combineLatest } from 'rxjs';
import { FileUploadComponent } from '../../../core/components/file-upload/file-upload.component';
import { TaskCommentsComponent } from '../../../core/components/task-comments/task-comments.component';
import { ToastActions } from '../../../core/state/toast/toast.actions';

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
          <div class="glass-panel w-full max-w-md p-8 relative">
            <button (click)="closeCreateModal()" class="absolute top-4 right-4 text-brand-secondary hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 class="text-2xl font-bold mb-6">Create New Task</h2>
            <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Task Title</label>
                <input formControlName="title" type="text" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all" placeholder="What needs to be done?">
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Description (Optional)</label>
                <textarea formControlName="description" rows="3" class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all placeholder-brand-secondary/50"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Priority</label>
                  <select formControlName="priority" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all text-white">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Status</label>
                  <select formControlName="status" class="w-full bg-black/40 border border-brand-border rounded-xl py-2 px-3 focus:outline-none focus:border-brand-primary/50 transition-all text-white">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="taskForm.invalid" class="premium-button w-full mt-6 py-3 disabled:opacity-50">Create Task</button>
            </form>
          </div>
        </div>
      }

      <!-- Filters & Stats -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Search tasks..." 
            class="w-full bg-white/5 border border-brand-border rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:border-brand-primary/50 transition-all">
        </div>

        <div class="flex gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand-primary"></span>
            <span class="text-brand-secondary">To Do: {{ (todoCount$ | async) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-brand-secondary">Done: {{ (doneCount$ | async) }}</span>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="space-y-3">
        @if (isLoading$ | async) {
          <div class="flex flex-col items-center justify-center p-20 space-y-4">
             <div class="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
             <p class="text-brand-secondary animate-pulse">Syncing tasks...</p>
          </div>
        } @else {
          @for (task of filteredTasks$ | async; track task.id) {
            <div class="flex flex-col gap-2">
              <div 
                (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)"
                class="glass-panel p-4 flex items-center gap-4 group hover:border-brand-primary/30 transition-all border-l-4 cursor-pointer"
                [style.border-left-color]="getPriorityColor(task.priority)"
                [class.border-brand-primary]="selectedTaskId === task.id"
              >
                <div class="flex-shrink-0">
                  <input 
                    type="checkbox" 
                    [checked]="task.status === 'DONE'"
                    (change)="toggleStatus(task); $event.stopPropagation()"
                    class="w-5 h-5 rounded border-brand-border bg-white/5 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                  >
                </div>

                <div class="flex-1 min-w-0">
                  <h4 [class.line-through]="task.status === 'DONE'" [class.opacity-50]="task.status === 'DONE'" class="font-medium truncate transition-all">
                    {{ task.title }}
                  </h4>
                  <div class="flex items-center gap-3 mt-1 text-xs text-brand-secondary">
                    <span [class]="getPriorityClass(task.priority)" class="px-1.5 py-0.5 rounded uppercase font-bold text-[9px]">
                      {{ task.priority }}
                    </span>
                    <span>•</span>
                    <span>Created {{ task.createdAt | date:'MMM d' }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                   <div class="text-[10px] text-brand-secondary bg-white/5 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                     Click to manage
                   </div>
                   <button class="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   </button>
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
  
  tasks$ = this.store.select(selectTasks);
  isLoading$ = this.store.select(selectIsLoading);
  searchControl = new FormControl('', { nonNullable: true });
  
  selectedTaskId: string | null = null;
  isModalOpen = false;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['MEDIUM', Validators.required],
    status: ['TODO', Validators.required]
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
    this.store.dispatch(TasksActions.loadTasks());
  }

  openCreateModal() { this.isModalOpen = true; }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.taskForm.reset({ priority: 'MEDIUM', status: 'TODO' });
  }

  submitTask() {
    if (this.taskForm.valid) {
      this.store.dispatch(TasksActions.createTask({ task: this.taskForm.value }));
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
