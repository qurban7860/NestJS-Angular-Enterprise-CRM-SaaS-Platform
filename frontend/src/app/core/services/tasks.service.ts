import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(filters?: { assigneeId?: string; contactId?: string; dealId?: string }): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl, { params: filters as any })
      .pipe(map(res => res.data));
  }

  createTask(task: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, task).pipe(map(res => res.data));
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${taskId}/status`, { status }).pipe(map(res => res.data));
  }

  getComments(taskId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${taskId}/comments`).pipe(map(res => res.data));
  }

  addComment(taskId: string, content: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${taskId}/comments`, { content }).pipe(map(res => res.data));
  }
}
