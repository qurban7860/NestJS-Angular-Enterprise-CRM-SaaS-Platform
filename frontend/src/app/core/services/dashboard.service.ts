import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalContacts: number;
  activeDealsCount: number;
  totalDealValue: number;
  taskCompletionRate: number;
  recentActivity: Array<{
    id: string;
    type: 'CONTACT' | 'DEAL' | 'TASK';
    action: string;
    label: string;
    timestamp: string;
    metadata?: any;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(map(res => res.data));
  }
}
