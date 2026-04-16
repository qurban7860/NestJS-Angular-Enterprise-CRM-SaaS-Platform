import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${taskId}`, { status });
  }
}
