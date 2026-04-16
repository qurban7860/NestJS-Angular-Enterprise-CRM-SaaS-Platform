import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FileService, FileUploadResponse } from '../../services/file.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div 
      class="relative group cursor-pointer"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
    >
      <input 
        #fileInput 
        type="file" 
        class="hidden" 
        [accept]="accept"
        (change)="onFileSelected($event)"
      >

      <div 
        class="glass-panel p-8 border-2 border-dashed border-white/5 group-hover:border-brand-primary/40 transition-all flex flex-col items-center justify-center gap-4 text-center"
        [class.border-brand-primary]="isDragging()"
      >
        <div class="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div>
           <p class="font-medium text-white group-hover:text-brand-primary transition-colors">
            {{ isUploading() ? 'Uploading...' : 'Click or drop files here' }}
           </p>
           <p class="text-xs text-brand-secondary mt-1">Maximum file size: {{ maxFileSizeMB }}MB</p>
        </div>

        @if (isUploading()) {
          <div class="w-full max-w-xs h-1 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full bg-brand-primary animate-progress"></div>
          </div>
        }

        @if (error()) {
          <p class="text-xs text-rose-400 animate-in fade-in">{{ error() }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    @keyframes progress {
      0% { width: 0%; }
      50% { width: 70%; }
      100% { width: 90%; }
    }
    .animate-progress {
      animation: progress 2s ease-in-out infinite;
    }
  `]
})
export class FileUploadComponent {
  private fileService = inject(FileService);

  @Input() accept = '*/*';
  @Input() maxFileSizeMB = 10;
  @Input() relatedEntityType?: string;
  @Input() relatedEntityId?: string;

  @Output() uploadSuccess = new EventEmitter<FileUploadResponse>();
  @Output() uploadError = new EventEmitter<string>();

  isDragging = signal(false);
  isUploading = signal(false);
  error = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  private handleFile(file: File) {
    // Basic validation
    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      this.error.set(`File size exceeds ${this.maxFileSizeMB}MB`);
      this.uploadError.emit(this.error()!);
      return;
    }

    this.isUploading.set(true);
    this.error.set(null);

    this.fileService.upload(file, this.relatedEntityType, this.relatedEntityId)
      .pipe(finalize(() => this.isUploading.set(false)))
      .subscribe({
        next: (response) => this.uploadSuccess.emit(response),
        error: (err) => {
          this.error.set(err.error?.message || 'Upload failed');
          this.uploadError.emit(this.error()!);
        }
      });
  }
}
