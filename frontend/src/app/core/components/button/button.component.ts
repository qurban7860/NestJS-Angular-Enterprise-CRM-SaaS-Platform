import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
      [class]="buttonClasses"
    >
      <span class="flex items-center justify-center gap-2" [class.opacity-0]="loading">
        <ng-content></ng-content>
      </span>
      <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center">
        <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'premium' | 'secondary' | 'ghost' | 'none' = 'secondary';
  @Input() disabled = false;
  @Input() active = false;
  @Input() loading = false;
  @Input() customClass = '';
  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const activeStyles = this.active ? 'bg-white/10 text-white ' : '';
    let variantStyles = '';
    switch (this.variant) {
      case 'premium':
        variantStyles = 'premium-button flex items-center gap-2 ';
        break;
      case 'ghost':
        variantStyles =
          'p-2 rounded-lg transition-all text-brand-secondary hover:text-white ';
        break;
      case 'secondary':
        variantStyles =
          'px-4 py-2 rounded-lg bg-white/5 border border-brand-border text-sm hover:bg-white/10 transition-all ';
        break;
      case 'none':
        variantStyles = '';
        break;
    }
    
    return `whitespace-nowrap relative ${variantStyles}${activeStyles}${this.customClass}`.trim();
  }
}