import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/billing`;

  createCheckoutSession(plan: 'PRO' | 'ENTERPRISE'): Observable<string> {
    return this.http
      .post<ApiResponse<{ url: string }>>(`${this.apiUrl}/checkout/session`, { plan })
      .pipe(map(res => res.data.url));
  }
}
