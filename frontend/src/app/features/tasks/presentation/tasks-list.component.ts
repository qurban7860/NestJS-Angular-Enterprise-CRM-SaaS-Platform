import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../../core/state/tasks/tasks.actions';
import { selectTasks, selectIsLoading } from '../../../core/state/tasks/tasks.reducer';
import { FormControl, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { map, startWith, combineLatest, Observable, take, debounceTime, distinctUntilChanged, switchMap, tap, of } from 'rxjs';
import { FileUploadComponent } from '../../../core/components/file-upload/file-upload.component';
import { TaskCommentsComponent } from '../../../core/components/task-comments/task-comments.component';
import { ToastActions } from '../../../core/state/toast/toast.actions';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { RequiresPremiumDirective } from '../../../core/directives/premium-gate.directive';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { selectStats } from '../../../core/state/dashboard/dashboard.reducer';
import { DashboardActions } from '../../../core/state/dashboard/dashboard.actions';
import { HasPermissionDirective } from '../../../core/directives/has-permission.directive';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUploadComponent, TaskCommentsComponent, DragDropModule, ConfirmModalComponent, RequiresPremiumDirective, HasPermissionDirective],
  template: `
    <div class="space-y-4 sm:space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-20 px-4 md:px-8">
      
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white/5 border border-brand-border rounded-2xl p-4 sm:p-6 glass-panel gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold">Tasks Pipeline</h1>
          <p class="text-brand-secondary text-xs sm:text-sm mt-1">Track your productivity and team assignments</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div class="flex bg-white/5 p-1 rounded-xl border border-white/10 flex-1 sm:flex-none">
            <button (click)="viewMode = 'LIST'" [class.bg-brand-primary]="viewMode === 'LIST'" [class.text-black]="viewMode === 'LIST'" class="flex-1 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap">
              <svg class="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg> LIST
            </button>
            <button (click)="viewMode = 'BOARD'" [class.bg-brand-primary]="viewMode === 'BOARD'" [class.text-black]="viewMode === 'BOARD'" class="flex-1 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap">
              <svg class="w-3.5 h-3.5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg> BOARD
            </button>
          </div>
          <button *appRequiresPremium (click)="exportTasks()" class="premium-button !bg-brand-secondary hover:!bg-brand-secondary/80 flex items-center gap-2 text-xs px-3 py-2 flex-1 sm:flex-none justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            <span class="hidden sm:inline">Export</span>
          </button>
          <button *hasPermission="'tasks:write'" (click)="openCreateModal()" class="premium-button flex items-center gap-2 text-xs px-4 py-2 flex-1 sm:flex-none justify-center">
            <span>+</span> <span class="whitespace-nowrap hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      <div class="glass-panel p-4 rounded-xl flex flex-row gap-4 items-center justify-between border border-white/5 relative z-20 overflow-x-auto">
  
  <div class="flex flex-1 gap-3 items-center min-w-0" [formGroup]="advancedFilters">

    <!-- Search -->
    <div class="relative w-64 shrink-0">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </span>
      <input formControlName="search" type="text" placeholder="Search tasks..."
        class="w-full bg-white/5 border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 ring-0 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200">
    </div>

    <!-- Priority -->
    <select formControlName="priority" class="custom-select w-40 shrink-0">
      <option value="">All Priorities</option>
      <option value="URGENT">Urgent</option>
      <option value="HIGH">High</option>
      <option value="MEDIUM">Medium</option>
      <option value="LOW">Low</option>
    </select>

    <!-- Assignee -->
    <select formControlName="assigneeId" class="custom-select w-44 shrink-0">
      <option value="">All Assignees</option>
      <option [value]="currentUserId">My Tasks</option>
      @for (user of users$ | async; track user.id) {
        <option [value]="user.id">{{ user.firstName }} {{ user.lastName }}</option>
      }
    </select>

    <!-- Clear -->
    @if (hasActiveFilters) {
      <button (click)="clearFilters()" class="text-xs text-brand-secondary hover:text-white whitespace-nowrap">
        Clear All
      </button>
    }

  </div>
</div>

      @if (selectedTasks.size > 0) {
        <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border border-brand-primary/50 shadow-[0_10px_40px_rgba(var(--brand-primary-rgb),0.2)] rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 z-50 animate-in slide-in-from-bottom-5 w-[90%] sm:w-auto">
          <span class="text-xs sm:text-sm font-bold text-white"><span class="text-brand-primary">{{selectedTasks.size}}</span> Tasks Selected</span>
          <div class="hidden sm:block w-px h-6 bg-white/10"></div>
          <div class="flex items-center gap-4">
            <button *hasPermission="'tasks:write'" (click)="bulkUpdateStatus('DONE')" class="text-[10px] sm:text-xs font-semibold hover:text-emerald-400 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Mark Done
            </button>
            <button *hasPermission="'tasks:delete'" (click)="bulkDelete()" class="text-[10px] sm:text-xs font-semibold hover:text-rose-400 transition-colors flex items-center gap-2 text-rose-500/80">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Delete
            </button>
            <button (click)="clearSelection()" class="text-[10px] sm:text-xs text-brand-secondary hover:text-white">Cancel</button>
          </div>
        </div>
      }

      @if (isLoading$ | async) {
        <div class="flex flex-col items-center justify-center p-12 sm:p-20 space-y-4">
            <div class="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p class="text-brand-secondary text-sm font-medium animate-pulse">Synchronizing tasks...</p>
        </div>
      } @else {
        
        @if (viewMode === 'BOARD') {
          <div class="flex gap-4 sm:gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-[500px] items-start -mx-4 px-4" cdkDropListGroup>
            @for (column of boardColumns; track column.id) {
              <div class="flex-shrink-0 w-72 sm:w-80 glass-panel bg-black/20 flex flex-col rounded-xl overflow-hidden border border-white/5">
                <div class="p-4 border-b border-white/5 flex justify-between items-center" [style.border-top-color]="column.color" style="border-top-width: 3px;">
                  <h3 class="font-bold text-[10px] sm:text-xs tracking-widest uppercase">{{ column.title }}</h3>
                  <span class="bg-white/10 text-[10px] px-2 py-0.5 rounded-full font-bold">{{ getTasksByStatus(column.id).length }}</span>
                </div>
                
                <div 
                  cdkDropList 
                  [cdkDropListData]="getTasksByStatus(column.id)" 
                  (cdkDropListDropped)="onDrop($event, column.id)"
                  class="flex-1 p-3 space-y-3 min-h-[150px] custom-scrollbar overflow-y-auto max-h-[60vh]"
                >
                  @for (task of getTasksByStatus(column.id); track task.id) {
                    <div cdkDrag class="glass-panel p-3 sm:p-4 rounded-lg border border-white/10 hover:border-brand-primary/40 cursor-grab active:cursor-grabbing bg-[#121212] group relative shadow-lg">
                      
                      <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" [class.opacity-100]="selectedTasks.has(task.id)">
                        <input type="checkbox" [checked]="selectedTasks.has(task.id)" (change)="toggleTaskSelection(task.id, $event)" class="w-4 h-4 rounded bg-black/50 border-white/20 accent-brand-primary cursor-pointer">
                      </div>

                      <div class="flex flex-col gap-2" (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)">
                        <div class="flex items-center gap-2 pr-6">
                           <span [class]="getPriorityClass(task.priority)" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">
                             {{ task.priority }}
                           </span>
                        </div>
                        <h4 class="font-bold text-xs sm:text-sm leading-tight group-hover:text-brand-primary transition-colors">{{ task.title }}</h4>
                        
                        <div class="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                          <div class="flex items-center gap-2 text-[10px] text-brand-secondary">
                            @if (task.dueDate) {
                              <span [class]="getDueDateClass(task.dueDate)" class="flex items-center gap-1 font-bold">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                {{ task.dueDate | date:'MMM d' }}
                              </span>
                            }
                          </div>
                          @if (task.assignee) {
                            <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-brand-primary border border-brand-primary/30" [title]="task.assignee.firstName + ' ' + task.assignee.lastName">
                              {{ task.assignee.firstName[0] }}{{ task.assignee.lastName[0] }}
                            </div>
                          } @else if (task.assigneeId) {
                            <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/5 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-brand-secondary border border-white/10" title="Assigned (ID)">
                              ?
                            </div>
                          }
                        </div>
                      </div>

                      <div class="absolute top-12 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex space-x-1">
                        <button *hasPermission="'tasks:write'" (click)="$event.stopPropagation(); editTask(task)" class="p-1.5 text-brand-secondary hover:text-white bg-black/60 rounded-lg">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button *hasPermission="'tasks:delete'" (click)="$event.stopPropagation(); deleteTask(task)" class="p-1.5 text-brand-secondary hover:text-red-400 bg-black/60 rounded-lg">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>

                      @if (selectedTaskId === task.id) {
                        <div class="mt-4 pt-4 border-t border-white/10 space-y-6 cursor-default" (click)="$event.stopPropagation()">
                          
                          <!-- Checklist Section -->
                          <div class="bg-black/20 rounded-xl p-4 border border-white/5 shadow-inner">
                            <h5 class="text-[10px] uppercase font-black tracking-widest text-brand-primary mb-4 flex items-center gap-2">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                              Checklist
                            </h5>
                            <div class="space-y-2.5">
                              @for (item of task.checklist; track $index) {
                                <div class="flex items-center gap-3 group/item bg-white/5 p-2 rounded-lg border border-transparent hover:border-white/10 transition-all">
                                  <input type="checkbox" [checked]="item.completed" (change)="toggleChecklistItem(task, $index)" class="w-4 h-4 rounded bg-black/50 border-white/10 accent-brand-primary cursor-pointer">
                                  <span [class.line-through]="item.completed" [class.opacity-50]="item.completed" class="text-xs flex-1 transition-all">{{ item.text }}</span>
                                  <button (click)="removeChecklistItem(task, $index)" class="opacity-0 group-hover/item:opacity-100 text-brand-secondary hover:text-red-400 transition-all">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                  </button>
                                </div>
                              }
                              <div class="flex items-center gap-2 mt-4">
                                <input #newItemInput (keyup.enter)="addChecklistItem(task, newItemInput.value); newItemInput.value = ''" type="text" placeholder="Add detailed sub-task..." class="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs outline-none focus:border-brand-primary/50 transition-all">
                                <button (click)="addChecklistItem(task, newItemInput.value); newItemInput.value = ''" class="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary/20 transition-all">
                                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div class="space-y-2">
                             <h5 class="text-[10px] uppercase font-black tracking-widest text-brand-secondary">Documents & Files</h5>
                             <app-file-upload [relatedEntityType]="'TASK'" [relatedEntityId]="task.id" (uploadSuccess)="onUploadSuccess($event)"></app-file-upload>
                          </div>

                          <div class="pt-4 border-t border-white/5">
                            <app-task-comments [taskId]="task.id"></app-task-comments>
                          </div>
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
                <div class="glass-panel p-3 sm:p-4 flex items-center gap-3 sm:gap-5 group hover:border-brand-primary/30 transition-all border-l-4 relative overflow-hidden"
                  [style.border-left-color]="getPriorityColor(task.priority)"
                  [class.border-brand-primary]="selectedTaskId === task.id">
                  
                  <div class="flex-shrink-0 z-10">
                    <input type="checkbox" [checked]="selectedTasks.has(task.id)" (change)="toggleTaskSelection(task.id, $event)"
                      class="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-black/50 text-brand-primary cursor-pointer accent-brand-primary">
                  </div>

                  <div class="flex-1 min-w-0 z-10 cursor-pointer" (click)="selectedTaskId = (selectedTaskId === task.id ? null : task.id)">
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <h4 [class.line-through]="task.status === 'DONE'" [class.opacity-40]="task.status === 'DONE'" class="font-bold text-sm sm:text-[15px] truncate transition-all">
                        {{ task.title }}
                      </h4>
                      <div class="flex gap-2">
                        <span [class]="getPriorityClass(task.priority)" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap">{{ task.priority }}</span>
                        <span class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-white/10 border border-white/5 whitespace-nowrap">{{ task.status.replace('_', ' ') }}</span>
                      </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5">
                      @if (task.dueDate) {
                        <span class="text-[10px] sm:text-[11px] font-bold flex items-center gap-1" [class]="getDueDateClass(task.dueDate)">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {{ task.dueDate | date:'MMM d, yyyy' }}
                        </span>
                      }
                    </div>
                  </div>
                  <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 space-x-1 sm:space-x-2 mr-0 sm:mr-4">
                    <button *hasPermission="'tasks:write'" (click)="$event.stopPropagation(); editTask(task)" class="p-1.5 text-brand-secondary hover:text-white bg-black/60 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button *hasPermission="'tasks:delete'" (click)="$event.stopPropagation(); deleteTask(task)" class="p-1.5 text-brand-secondary hover:text-red-400 bg-black/60 rounded-lg">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>

                @if (selectedTaskId === task.id) {
                  <div class="glass-panel mx-4 p-4 border-t-0 rounded-t-none animate-in slide-in-from-top-2 duration-300 space-y-6">
                    <div class="space-y-2">
                      <h5 class="text-[10px] uppercase font-black tracking-widest text-brand-secondary">Documents & Files</h5>
                      <app-file-upload [relatedEntityType]="'TASK'" [relatedEntityId]="task.id" (uploadSuccess)="onUploadSuccess($event)"></app-file-upload>
                    </div>
                    <div class="pt-4 border-t border-white/5">
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

    @if (isConfirmModalOpen) {
      <app-confirm-modal
        [title]="taskToDelete ? 'Delete Task' : 'Delete Selected Tasks'"
        [message]="taskToDelete ? 'Are you sure you want to delete task ' + taskToDelete.title + '?' : 'Are you sure you want to delete ' + selectedTasks.size + ' selected tasks?'"
        confirmText="Delete"
        (confirm)="confirmDelete()"
        (cancel)="cancelDelete()"
      ></app-confirm-modal>
    }

    @if (isModalOpen) {
      <div class="fixed inset-0 bg-black/65 backdrop-blur-[6px] z-[100] flex items-center justify-center animate-in fade-in duration-200 p-2 sm:p-4">
        <div class="glass-panel w-full max-w-lg p-4 sm:p-8 relative max-h-[95vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
          <button (click)="closeCreateModal()" class="absolute top-6 right-6 text-brand-secondary hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <div class="mb-6">
            <h2 class="text-lg sm:text-2xl font-black italic uppercase tracking-tighter">{{ editingTaskId ? 'Update' : 'Generate' }} <span class="text-brand-primary">Task</span></h2>
          </div>
          <form [formGroup]="taskForm" (ngSubmit)="submitTask()" class="space-y-5">
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Task Title</label>
                <input formControlName="title" type="text" placeholder="e.g., Follow up on Q2 proposal" 
                class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200">
              </div>

              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Description</label>
                <textarea formControlName="description" rows="3" placeholder="Add context..." 
                class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 resize-none"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Priority Level</label>
                  <select formControlName="priority" class="custom-select">
                    <option value="LOW" class="bg-[#0d0d0f]">Low Priority</option>
                    <option value="MEDIUM" class="bg-[#0d0d0f]">Medium Priority</option>
                    <option value="HIGH" class="bg-[#0d0d0f]">High Priority</option>
                    <option value="URGENT" class="bg-[#0d0d0f]">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Due Date</label>
                  <input formControlName="dueDate" type="date" 
                  class="cursor-pointer w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 [color-scheme:dark]">
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-white/5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-1">Assign To</label>
                <select formControlName="assigneeId" class="custom-select cursor-pointer">
                  <option value="" class="bg-[#0d0d0f]">Unassigned</option>
                  @for (user of users$ | async; track user.id) {
                    <option [value]="user.id" class="bg-[#0d0d0f]">{{ user.firstName }} {{ user.lastName }}</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Associate Contact</label>
                  <div class="relative">
                    <input [formControl]="contactSearchControl" type="text" placeholder="Search contacts..." 
                           class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-xs">
                    @if (contactSearchResults$ | async; as results) {
                      @if (results.length > 0 && showContactResults) {
                        <div class="absolute top-full left-0 right-0 mt-1 glass-panel z-[60] border border-white/10 max-h-40 overflow-y-auto shadow-2xl">
                          @for (c of results; track c.id) {
                            <div (click)="selectContact(c)" class="p-2 hover:bg-white/10 cursor-pointer text-[10px] font-bold">{{ c.fullName }}</div>
                          }
                        </div>
                      }
                    }
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-brand-secondary mb-1">Associate Deal</label>
                  <div class="relative">
                    <input [formControl]="dealSearchControl" type="text" placeholder="Search deals..." 
                           class="w-full bg-white/5 border border-brand-border rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-xs">
                    @if (dealSearchResults$ | async; as results) {
                      @if (results.length > 0 && showDealResults) {
                        <div class="absolute top-full left-0 right-0 mt-1 glass-panel z-[60] border border-white/10 max-h-40 overflow-y-auto shadow-2xl">
                          @for (d of results; track d.id) {
                            <div (click)="selectDeal(d)" class="p-2 hover:bg-white/10 cursor-pointer text-[10px] font-bold">{{ d.title }}</div>
                          }
                        </div>
                      }
                    }
                  </div>
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
                {{ editingTaskId ? 'Update Task' : 'Create Task' }}
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
  private subService = inject(SubscriptionService);
  
  // Data Streams
  tasks$ = this.store.select(selectTasks);
  stats$ = this.store.select(selectStats);
  isLoading$ = this.store.select(selectIsLoading);
  users$: Observable<any[]> = this.authService.getUsers();
  contacts$: Observable<any[]> = this.crmService.getContacts();
  deals$: Observable<any[]> = this.crmService.getDeals();

  // State Management
  viewMode: 'LIST' | 'BOARD' = 'BOARD';
  selectedTaskId: string | null = null;
  isModalOpen = false;
  isConfirmModalOpen = false;
  taskToDelete: any = null;
  editingTaskId: string | null = null;
  currentUserId: string | null = null;
  
  // Bulk Actions State
  selectedTasks = new Set<string>();

  // Search State
  contactSearchControl = new FormControl('');
  contactSearchResults$: Observable<any[]> = of([]);
  showContactResults = false;
  
  dealSearchControl = new FormControl('');
  dealSearchResults$: Observable<any[]> = of([]);
  showDealResults = false;

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
      this.store.dispatch(DashboardActions.loadStats());
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

    // Search pipelines
    this.contactSearchResults$ = this.contactSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q: string | null) => q && typeof q === 'string' && q.length >= 2 ? this.crmService.searchContacts(q) : of([])),
      tap(() => this.showContactResults = true)
    );

    this.dealSearchResults$ = this.dealSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q: string | null) => q && typeof q === 'string' && q.length >= 2 ? this.crmService.searchDeals(q) : of([])),
      tap(() => this.showDealResults = true)
    );
  }

  selectContact(c: any) {
    this.taskForm.patchValue({ contactId: c.id });
    this.contactSearchControl.setValue(c.fullName, { emitEvent: false });
    this.showContactResults = false;
  }

  selectDeal(d: any) {
    this.taskForm.patchValue({ dealId: d.id });
    this.dealSearchControl.setValue(d.title, { emitEvent: false });
    this.showDealResults = false;
  }

  addChecklistItem(task: any, text: string) {
    if (!text) return;
    const checklist = [...(task.checklist || []), { text, completed: false }];
    this.store.dispatch(TasksActions.updateTask({ id: task.id, task: { checklist } }));
  }

  toggleChecklistItem(task: any, index: number) {
    const checklist = task.checklist.map((item: any, i: number) => 
      i === index ? { ...item, completed: !item.completed } : item
    );
    this.store.dispatch(TasksActions.updateTask({ id: task.id, task: { checklist } }));
  }

  removeChecklistItem(task: any, index: number) {
    const checklist = task.checklist.filter((_: any, i: number) => i !== index);
    this.store.dispatch(TasksActions.updateTask({ id: task.id, task: { checklist } }));
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
    this.taskToDelete = null;
    this.isConfirmModalOpen = true;
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

  openCreateModal() { 
    combineLatest([this.subService.limits$, this.stats$]).pipe(take(1)).subscribe((data: any) => {
      const [limits, stats] = data;
      if (stats.totalTasks >= limits.maxTasks) {
        this.store.dispatch(ToastActions.showToast({ 
          message: `Task limit reached (${limits.maxTasks}). Please upgrade your plan to add more.`, 
          toastType: 'error' 
        }));
        return;
      }
      this.editingTaskId = null;
      this.taskForm.reset({ priority: 'MEDIUM', status: 'TODO', assigneeId: '', contactId: '', dealId: '', dueDate: '' });
      this.contactSearchControl.setValue('');
      this.dealSearchControl.setValue('');
      this.isModalOpen = true; 
    });
  }
  closeCreateModal() { 
    this.isModalOpen = false;
    this.editingTaskId = null;
    this.taskForm.reset({ priority: 'MEDIUM', status: 'TODO', assigneeId: '', contactId: '', dealId: '', dueDate: '' });
    this.contactSearchControl.setValue('');
    this.dealSearchControl.setValue('');
  }

  submitTask() {
    if (this.taskForm.valid) {
      const taskData: any = { ...this.taskForm.getRawValue() };
      if (taskData.dueDate) taskData.dueDate = new Date(taskData.dueDate).toISOString();
      ['assigneeId', 'contactId', 'dealId', 'dueDate'].forEach(f => { if (!taskData[f]) taskData[f] = null; });
      
      if (this.editingTaskId) {
        this.store.dispatch(TasksActions.updateTask({ id: this.editingTaskId, task: taskData }));
      } else {
        this.store.dispatch(TasksActions.createTask({ task: taskData }));
      }
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

  editTask(task: any) {
    this.editingTaskId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assigneeId: task.assigneeId || '',
      contactId: task.contactId || '',
      dealId: task.dealId || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    
    // Set search control values for edit mode
    if (task.contactId) this.contactSearchControl.setValue('Linked Contact', { emitEvent: false });
    if (task.dealId) this.dealSearchControl.setValue('Linked Deal', { emitEvent: false });

    this.isModalOpen = true;
  }

  deleteTask(task: any) {
    this.taskToDelete = task;
    this.isConfirmModalOpen = true;
  }

  confirmDelete() {
    if (this.taskToDelete) {
      this.store.dispatch(TasksActions.deleteTask({ id: this.taskToDelete.id }));
    } else {
      const taskIds = Array.from(this.selectedTasks);
      taskIds.forEach(id => {
        this.store.dispatch(TasksActions.deleteTask({ id }));
      });
      this.clearSelection();
      this.store.dispatch(ToastActions.showToast({ message: `Tasks deleted`, toastType: 'success' }));
    }
    this.isConfirmModalOpen = false;
    this.taskToDelete = null;
  }

  cancelDelete() {
    this.isConfirmModalOpen = false;
    this.taskToDelete = null;
  }

  exportTasks() {
    this.store.dispatch(TasksActions.exportTasks({ filters: this.advancedFilters.value }));
  }
}