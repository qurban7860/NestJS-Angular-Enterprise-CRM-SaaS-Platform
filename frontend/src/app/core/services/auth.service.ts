import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(map(res => res.data));
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data)
      .pipe(map(res => res.data));
  }

  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`)
      .pipe(map(res => res.data));
  }

  getUsers(): Observable<User[]> {
    const baseUrl = this.apiUrl.replace('/auth', '/users');
    return this.http.get<ApiResponse<User[]>>(baseUrl)
      .pipe(map(res => res.data));
  }
}
