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
      .pipe(map(res => res.data || res as any));
  }

  getTask(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data || res as any));
  }

  createTask(task: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, task)
      .pipe(map(res => res.data || res as any));
  }

  updateTask(id: string, task: any): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}`, task)
      .pipe(map(res => res.data || res as any));
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${taskId}/status`, { status })
      .pipe(map(res => res.data || res as any));
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportTasks(filters?: { assigneeId?: string; contactId?: string; dealId?: string }): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { 
      params: filters as any,
      responseType: 'blob' 
    });
  }

  getComments(taskId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${taskId}/comments`)
      .pipe(map(res => res.data || res as any));
  }

  addComment(taskId: string, content: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${taskId}/comments`, { content })
      .pipe(map(res => res.data || res as any));
  }
}
