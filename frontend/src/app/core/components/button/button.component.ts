import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      [class]="buttonClasses"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'premium' | 'secondary' | 'ghost' | 'none' = 'secondary';
  @Input() disabled = false;
  @Input() active = false;
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
    return `${variantStyles}${activeStyles}${this.customClass}`.trim();
  }
}
