import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FileService, FileUploadResponse } from '../../services/file.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="space-y-4">
      <!-- File List -->
      @if (files().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          @for (file of files(); track file.id) {
            <div class="glass-panel p-3 flex items-center justify-between gap-3 border border-white/5">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 flex-shrink-0 rounded bg-brand-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate text-white" [title]="file.originalName">{{ file.originalName }}</p>
                  <p class="text-[10px] text-brand-secondary">{{ (file.sizeBytes / 1024).toFixed(1) }} KB</p>
                </div>
              </div>
              <a [href]="getFileUrl(file.id)" target="_blank" class="p-1.5 hover:bg-white/10 rounded transition-colors text-brand-secondary hover:text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          }
        </div>
      }

      <!-- Uploader -->
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
export class FileUploadComponent implements OnInit {
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
  files = signal<FileUploadResponse[]>([]);

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles() {
    if (this.relatedEntityType && this.relatedEntityId) {
      this.fileService.getFilesByEntity(this.relatedEntityType, this.relatedEntityId)
        .subscribe(res => {
          this.files.set(res);
        });
    }
  }

  getFileUrl(id: string): string {
    return this.fileService.getFileUrl(id);
  }

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
        next: (response) => {
          this.files.update(f => [...f, response]);
          this.uploadSuccess.emit(response);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Upload failed');
          this.uploadError.emit(this.error()!);
        }
      });
  }
}
