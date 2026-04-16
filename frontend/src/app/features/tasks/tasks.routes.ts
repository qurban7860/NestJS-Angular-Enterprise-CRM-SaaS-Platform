import { Routes } from '@angular/router';
import { TasksListComponent } from './presentation/tasks-list.component';

export const TASK_ROUTES: Routes = [
  { path: '', component: TasksListComponent }
];
