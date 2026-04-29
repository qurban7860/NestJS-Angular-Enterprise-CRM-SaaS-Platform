import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.reducer';
import { Subject, takeUntil } from 'rxjs';
import { DEFAULT_ROLE_PERMISSIONS } from '../constants/default-permissions';

/**
 * Structural directive to hide/show elements based on the active user's permissions.
 *
 * Usage:
 * <button *hasPermission="['tasks:delete']">Delete Task</button>
 *
 * Logic:
 * 1. Admins (role === 'ADMIN') pass all permission checks automatically.
 * 2. For non-admins, if a customRole exists, we check if ALL provided permissions are present.
 * 3. If the user has no custom role and is not an ADMIN, the element is hidden.
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private store = inject(Store);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private destroy$ = new Subject<void>();

  private requiredPermissions: string[] = [];
  
  @Input() requireAll: boolean = true;

  @Input() set hasPermission(val: string[] | string | null | undefined) {
    if (typeof val === 'string') {
      this.requiredPermissions = [val];
    } else if (Array.isArray(val)) {
      this.requiredPermissions = val;
    } else {
      this.requiredPermissions = [];
    }
    this.updateView();
  }

  private userPermissions: string[] = [];
  private userRole: string | null = null;

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userRole = user.role;
          
          // Logic: 
          // 1. If custom role exists, use its permissions
          // 2. Otherwise, use default permissions for the role
          if (user.customRole) {
            this.userPermissions = user.customRole.permissions || [];
          } else {
            this.userPermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
          }
        } else {
          this.userRole = null;
          this.userPermissions = [];
        }
        this.updateView();
      });
  }

  private updateView(): void {
    const hasAccess = this.checkPermissions();
    
    this.viewContainer.clear();
    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private checkPermissions(): boolean {
    // 1. Admins bypass all permission checks
    if (this.userRole === 'ADMIN') {
      return true;
    }

    // 2. If no permissions are required, allow access
    if (this.requiredPermissions.length === 0) {
      return true;
    }

    // 3. For others, check based on requireAll flag
    if (this.requireAll) {
      return this.requiredPermissions.every(p => this.userPermissions.includes(p));
    } else {
      return this.requiredPermissions.some(p => this.userPermissions.includes(p));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
