import { Injectable, signal, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.reducer';

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
  private readonly apiUrl = `${environment.apiUrl}/broadcasting`;

  // Signal to store active broadcasts for the current session
  activeBroadcasts = signal<Broadcast[]>([]);

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    this.store.select(selectUser).subscribe(user => {
      if (user) {
        if (!this.socket?.connected) {
          this.connect();
          this.fetchActiveBroadcasts();
        }
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
    if (this.socket?.connected) return;

    const token = localStorage.getItem('access_token');
    
    this.socket = io(`${environment.socketUrl}/broadcast`, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('broadcast:received', (broadcast: Broadcast) => {
      console.log('Broadcast received via socket:', broadcast.title);
      // Avoid duplicates if initial fetch and socket happen simultaneously
      this.activeBroadcasts.update(current => {
        const exists = current.some(b => b.id === broadcast.id);
        return exists ? current : [broadcast, ...current];
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
