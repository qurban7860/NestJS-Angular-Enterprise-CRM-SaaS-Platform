import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/crm`;

  // ── Contacts ────────────────────────────────────────────────
  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contacts`);
  }

  createContact(contact: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contacts`, contact);
  }

  // ── Deals ───────────────────────────────────────────────────
  getDeals(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deals`);
  }
}
