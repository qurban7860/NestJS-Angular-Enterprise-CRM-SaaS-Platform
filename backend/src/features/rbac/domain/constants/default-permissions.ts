export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  MANAGER: [
    'contacts:read',
    'contacts:write',
    'deals:read',
    'deals:write',
    'tasks:read',
    'tasks:write',
    'reports:read',
    'workflows:read',
    'team:read',
    'team:write',
    'roles:read',
  ],
  MEMBER: ['contacts:read', 'deals:read', 'tasks:read', 'tasks:write'],
};
