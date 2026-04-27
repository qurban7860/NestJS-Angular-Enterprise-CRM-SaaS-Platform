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
export class PremiumService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/premium`;

  // Custom Roles
  getCustomRoles(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/roles`)
      .pipe(map(res => res.data || res as any));
  }

  createCustomRole(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/roles`, data)
      .pipe(map(res => res.data || res as any));
  }

  assignRole(roleId: string, userId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/roles/${roleId}/assign/${userId}`, {})
      .pipe(map(res => res.data || res as any));
  }

  unassignRole(userId: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/roles/unassign/${userId}`, {})
      .pipe(map(res => res.data || res as any));
  }

  // Workflows
  getWorkflows(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/workflows`)
      .pipe(map(res => res.data || res as any));
  }

  createWorkflow(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/workflows`, data)
      .pipe(map(res => res.data || res as any));
  }

  // Reports
  getReports(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/reports`)
      .pipe(map(res => res.data || res as any));
  }

  createReport(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reports`, data)
      .pipe(map(res => res.data || res as any));
  }

  getOrgUsers(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/auth/users`)
      .pipe(map(res => res.data || res as any));
  }

  addTeamMember(data: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/auth/users`, data)
      .pipe(map(res => res.data || res as any));
  }
}
