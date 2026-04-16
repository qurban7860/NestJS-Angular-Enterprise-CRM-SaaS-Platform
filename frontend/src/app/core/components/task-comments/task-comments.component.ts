import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Comment List -->
      <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        @for (comment of comments(); track comment.id) {
          <div class="flex gap-3 animate-in slide-in-from-left-2 duration-300">
            <div class="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold text-brand-primary shrink-0">
              {{ comment.authorName.charAt(0) }}
            </div>
            <div class="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3">
              <div class="flex justify-between items-center mb-1">
                <span class="text-[11px] font-bold text-brand-primary cursor-default">{{ comment.authorName }}</span>
                <span class="text-[10px] text-brand-secondary">{{ comment.createdAt | date:'shortTime' }}</span>
              </div>
              <p class="text-xs text-white/90 leading-relaxed">{{ comment.content }}</p>
            </div>
          </div>
        } @empty {
          <p class="text-[11px] text-brand-secondary text-center py-4 italic">No comments yet. Start the conversation!</p>
        }
      </div>

      <!-- Input Area -->
      <div class="flex gap-2">
        <input 
          [(ngModel)]="newCommentText" 
          (keyup.enter)="postComment()"
          placeholder="Add a comment..." 
          class="flex-1 bg-black/40 border border-brand-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/50 transition-all"
        >
        <button 
          (click)="postComment()" 
          [disabled]="!newCommentText.trim() || isSubmitting()"
          class="bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
  `]
})
export class TaskCommentsComponent implements OnInit {
  private tasksService = inject(TasksService);

  @Input({ required: true }) taskId!: string;

  comments = signal<any[]>([]);
  newCommentText = '';
  isSubmitting = signal(false);

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.tasksService.getComments(this.taskId).subscribe(res => {
      this.comments.set(res);
    });
  }

  postComment() {
    if (!this.newCommentText.trim() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.tasksService.addComment(this.taskId, this.newCommentText)
      .subscribe({
        next: (comment) => {
          this.comments.update(c => [...c, comment]);
          this.newCommentText = '';
          this.isSubmitting.set(false);
        },
        error: () => this.isSubmitting.set(false)
      });
  }
}
