import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Store } from '@ngrx/store';
import { selectAccessToken } from '../state/auth/auth.reducer';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private store = inject(Store);

  // Custom events observable
  private notificationSubject = new Subject<any>();
  notifications$ = this.notificationSubject.asObservable();

  constructor() {
    this.init();
  }

  private init() {
    this.store.select(selectAccessToken).subscribe(token => {
      if (token) {
        this.connect(token);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${environment.socketUrl}/notifications`, {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Real-time connection established');
    });

    this.socket.on('notification', (data) => {
      this.notificationSubject.next(data);
    });

    this.socket.on('disconnect', () => {
      console.log('Real-time connection closed');
    });
  }

  private disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}
