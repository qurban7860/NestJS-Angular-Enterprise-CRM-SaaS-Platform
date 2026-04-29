import { SetMetadata } from '@nestjs/common';

// ─────────────────────────────────────────────────────────────────────────────
// @RequirePermissions — Route-level decorator that activates PermissionsGuard.
//
// Usage:
//   @Patch(':id')
//   @RequirePermissions('contacts:write')
//   async update(...) { ... }
//
//   @Delete(':id')
//   @RequirePermissions('tasks:delete', 'tasks:write')  // AND logic — ALL required
//   async delete(...) { ... }
//
// Permission string convention: '<resource>:<action>'
// Valid resources: contacts, deals, tasks, reports, workflows, roles
// Valid actions:   read, write, delete
// ─────────────────────────────────────────────────────────────────────────────

export const PERMISSIONS_KEY = 'requiredPermissions';

export type Permission =
  | 'contacts:read'
  | 'contacts:write'
  | 'contacts:delete'
  | 'deals:read'      | 'deals:write'      | 'deals:delete'
  | 'tasks:read'      | 'tasks:write'      | 'tasks:delete'
  | 'reports:read'    | 'reports:write'    | 'reports:delete'
  | 'workflows:read'  | 'workflows:write'  | 'workflows:delete'
  | 'roles:read'      | 'roles:write'      | 'roles:delete'
  | 'broadcast:read'  | 'broadcast:write'
  | 'team:read'       | 'team:write'       | 'team:delete';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
