import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/files`;

  upload(file: File, relatedEntityType?: string, relatedEntityId?: string): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (relatedEntityType) formData.append('relatedEntityType', relatedEntityType);
    if (relatedEntityId) formData.append('relatedEntityId', relatedEntityId);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData).pipe(
      map(res => (res as any).data)
    );
  }

  getFilesByEntity(relatedEntityType: string, relatedEntityId: string): Observable<FileUploadResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/entity/${relatedEntityType}/${relatedEntityId}`).pipe(
      map(res => (res as any).data)
    );
  }

  getFileUrl(id: string): string {
    return `${this.apiUrl}/${id}`;
  }
}
