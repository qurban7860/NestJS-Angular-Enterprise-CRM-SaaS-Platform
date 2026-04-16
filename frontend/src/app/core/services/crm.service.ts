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
export class CrmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/crm`;

  // ── Contacts ────────────────────────────────────────────────
  getContacts(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/contacts`)
      .pipe(map(res => res.data));
  }

  createContact(contact: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/contacts`, contact)
      .pipe(map(res => res.data));
  }

  // ── Deals ───────────────────────────────────────────────────
  getDeals(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/deals`)
      .pipe(map(res => res.data));
  }

  createDeal(deal: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deals`, deal)
      .pipe(map(res => res.data));
  }

  updateDealStage(dealId: string, stage: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/deals/${dealId}/stage`, { stage })
      .pipe(map(res => res.data));
  }
}
