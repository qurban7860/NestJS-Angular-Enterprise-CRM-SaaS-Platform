import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { SubscriptionService } from '../services/subscription.service';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[appRequiresPremium]',
  standalone: true
})
export class RequiresPremiumDirective implements OnInit, OnDestroy {
  private subscriptionService = inject(SubscriptionService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  private elseTemplateRef: TemplateRef<any> | null = null;
  private requiredPlan: 'FREE' | 'PREMIUM' | 'ENTERPRISE' = 'PREMIUM';

  @Input() set appRequiresPremium(val: 'FREE' | 'PREMIUM' | 'ENTERPRISE' | string | boolean | null) {
    if (val && typeof val === 'string' && ['FREE', 'PREMIUM', 'ENTERPRISE'].includes(val)) {
      this.requiredPlan = val as any;
    }
  }

  @Input() set appRequiresPremiumElse(template: TemplateRef<any>) {
    this.elseTemplateRef = template;
  }

  @Input() appRequiresPremiumDegraded = false;

  ngOnInit(): void {
    this.subscriptionService.hasPlan(this.requiredPlan)
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasAccess => {
        this.viewContainer.clear();
        
        if (hasAccess) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
          if (this.elseTemplateRef) {
            this.viewContainer.createEmbeddedView(this.elseTemplateRef);
          } else if (this.appRequiresPremiumDegraded) {
            const view = this.viewContainer.createEmbeddedView(this.templateRef);
            view.rootNodes[0].classList.add('premium-locked');
            view.rootNodes[0].title = `Upgrade to ${this.requiredPlan} to unlock this feature`;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
