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
      .pipe(map(res => res.data || res as any));
  }

  getContact(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/contacts/${id}`)
      .pipe(map(res => res.data || res as any));
  }

  createContact(contact: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/contacts`, contact)
      .pipe(map(res => res.data || res as any));
  }

  updateContact(id: string, contact: any): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/contacts/${id}`, contact)
      .pipe(map(res => res.data || res as any));
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/contacts/${id}`);
  }

  exportContacts(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/contacts/export`, { responseType: 'blob' });
  }

  // ── Deals ───────────────────────────────────────────────────
  getDeals(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/deals`)
      .pipe(map(res => res.data || res as any));
  }

  getDeal(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/deals/${id}`)
      .pipe(map(res => res.data || res as any));
  }

  createDeal(deal: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deals`, deal)
      .pipe(map(res => res.data || res as any));
  }

  updateDeal(id: string, deal: any): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/deals/${id}`, deal)
      .pipe(map(res => res.data || res as any));
  }

  updateDealStage(dealId: string, stage: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/deals/${dealId}/stage`, { stage })
      .pipe(map(res => res.data || res as any));
  }

  deleteDeal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deals/${id}`);
  }

  exportDeals(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/deals/export`, { responseType: 'blob' });
  }
}
