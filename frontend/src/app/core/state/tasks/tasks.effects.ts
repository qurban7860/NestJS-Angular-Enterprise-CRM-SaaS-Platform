import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksService } from '../../services/tasks.service';
import { TasksActions } from './tasks.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ToastActions } from '../toast/toast.actions';
import { DashboardActions } from '../dashboard/dashboard.actions';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private tasksService = inject(TasksService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      mergeMap(({ filters }) =>
        this.tasksService.getTasks(filters).pipe(
          map(tasks => TasksActions.loadTasksSuccess({ tasks })),
          catchError(error => of(TasksActions.loadTasksFailure({ error: error.message })))
        )
      )
    )
  );

  loadTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTask),
      mergeMap(({ id }) =>
        this.tasksService.getTask(id).pipe(
          map(task => TasksActions.loadTaskSuccess({ task })),
          catchError(error => of(TasksActions.loadTaskFailure({ error: error.message })))
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      mergeMap(({ task }) =>
        this.tasksService.createTask(task).pipe(
          switchMap(newTask => [
            TasksActions.createTaskSuccess({ task: newTask }),
            ToastActions.showToast({ 
              message: 'New task added successfully', 
              toastType: 'success' 
            }),
            DashboardActions.loadStats()
          ]),
          catchError(error => of(TasksActions.createTaskFailure({ error: error.message })))
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      mergeMap(({ id, task }) =>
        this.tasksService.updateTask(id, task).pipe(
          switchMap(updatedTask => [
            TasksActions.updateTaskSuccess({ task: updatedTask }),
            ToastActions.showToast({ 
              message: 'Task updated successfully', 
              toastType: 'success' 
            })
          ]),
          catchError(error => of(TasksActions.updateTaskFailure({ error: error.message })))
        )
      )
    )
  );

  updateTaskStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTaskStatus),
      mergeMap(({ taskId, status }) =>
        this.tasksService.updateTaskStatus(taskId, status).pipe(
          map(updatedTask => TasksActions.updateTaskStatusSuccess({ task: updatedTask })),
          catchError(error => of(TasksActions.updateTaskStatusFailure({ error: error.message })))
        )
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      mergeMap(({ id }) =>
        this.tasksService.deleteTask(id).pipe(
          switchMap(() => [
            TasksActions.deleteTaskSuccess({ id }),
            ToastActions.showToast({ 
              message: 'Task deleted successfully', 
              toastType: 'success' 
            }),
            DashboardActions.loadStats()
          ]),
          catchError(error => of(TasksActions.deleteTaskFailure({ error: error.message })))
        )
      )
    )
  );

  exportTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.exportTasks),
      mergeMap(({ filters }) =>
        this.tasksService.exportTasks(filters).pipe(
          map(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tasks.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return TasksActions.exportTasksSuccess();
          }),
          catchError(error => of(TasksActions.exportTasksFailure({ error: error.message })))
        )
      )
    )
  );
}
