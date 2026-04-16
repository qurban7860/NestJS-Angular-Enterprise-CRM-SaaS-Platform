import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksService } from '../../services/tasks.service';
import { TasksActions } from './tasks.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { ToastActions } from '../toast/toast.actions';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private tasksService = inject(TasksService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      mergeMap(() =>
        this.tasksService.getTasks().pipe(
          map(tasks => TasksActions.loadTasksSuccess({ tasks })),
          catchError(error => of(TasksActions.loadTasksFailure({ error: error.message })))
        )
      )
    )
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      mergeMap(({ task }) =>
        this.tasksService.createTask(task).pipe(
          map(newTask => TasksActions.createTaskSuccess({ task: newTask })),
          tap(() => ToastActions.showToast({ 
            message: 'New task added successfully', 
            toastType: 'success' 
          })),
          catchError(error => of(TasksActions.createTaskFailure({ error: error.message })))
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
}
