import { Injectable, signal, inject, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map, delay, take, filter, switchMap, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser, selectAccessToken } from '../state/auth/auth.reducer';

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  createdAt: string;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BroadcastingService {
  private socket?: Socket;
  private readonly store = inject(Store);
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  private readonly apiUrl = `${environment.apiUrl}/broadcasting`;

  // Signal to store active broadcasts for the current session
  activeBroadcasts = signal<Broadcast[]>([]);

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    // Combine user and token to ensure we have everything needed for authenticated requests
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        // Use a small delay to ensure effects have finished saving token to localStorage
        // This prevents the race condition where the first 'active' fetch has no token
        setTimeout(() => {
          if (!this.socket) {
            this.connect();
          }
          this.fetchActiveBroadcasts();
        }, 100);
      } else {
        this.disconnect();
      }
    });
  }

  private fetchActiveBroadcasts() {
    this.getInitialBroadcasts().subscribe({
      next: broadcasts => this.activeBroadcasts.set(broadcasts),
      error: err => console.error('Signal Error:', err)
    });
  }

  private connect() {
    if (this.socket) return;

    const token = localStorage.getItem('access_token');
    
    this.socket = io(`${environment.socketUrl}/broadcast`, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('broadcast:received', (broadcast: Broadcast) => {
      console.log('Broadcast received via socket:', broadcast.title);
      // Avoid duplicates if initial fetch and socket happen simultaneously
      this.zone.run(() => {
        this.activeBroadcasts.update(current => {
          const exists = current.some(b => b.id === broadcast.id);
          return exists ? current : [broadcast, ...current];
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from broadcast gateway:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Broadcast Connection Error:', error.message);
    });
  }

  private disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
    this.activeBroadcasts.set([]);
  }

  private getInitialBroadcasts(): Observable<Broadcast[]> {
    return this.http.get<{ data: Broadcast[] }>(`${this.apiUrl}/active`).pipe(
      map(res => res.data)
    );
  }

  sendBroadcast(dto: any): Observable<any> {
    return this.http.post<{ data: any }>(this.apiUrl, dto).pipe(map(res => res.data));
  }

  deactivateBroadcast(id: string): Observable<any> {
    return this.http.patch<{ data: any }>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(map(res => res.data));
  }

  dismiss(id: string) {
    this.activeBroadcasts.update(current => current.filter(b => b.id !== id));
  }
}
