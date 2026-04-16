import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  getFileUrl(id: string): string {
    return `${this.apiUrl}/${id}`;
  }
}
