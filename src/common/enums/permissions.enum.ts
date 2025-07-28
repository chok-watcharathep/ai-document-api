// src/common/constants/permissions.enum.ts

export enum AppPermission {
  // User Management
  READ_USERS = 'read:users',
  CREATE_USER = 'create:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  // Product Management (example)
  READ_PRODUCTS = 'read:products',
  CREATE_PRODUCT = 'create:product',
  UPDATE_PRODUCT = 'update:product',
  DELETE_PRODUCT = 'delete:product',
  PUBLISH_PRODUCT = 'publish:product', // Example of a specific permission

  // Admin specific permissions
  MANAGE_ROLES = 'manage:roles',
  VIEW_AUDIT_LOGS = 'view:audit_logs',
}

// You might also define roles and map them to permissions
export enum AppRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  USER = 'user', // Default role for regular users
}

// Helper mapping roles to permissions (optional, but useful)
// This mapping is used by the PermissionsGuard to determine user permissions.
export const RolePermissions: Record<AppRole, AppPermission[]> = {
  [AppRole.ADMIN]: [
    AppPermission.READ_USERS,
    AppPermission.CREATE_USER,
    AppPermission.UPDATE_USER,
    AppPermission.DELETE_USER,
    AppPermission.READ_PRODUCTS,
    AppPermission.CREATE_PRODUCT,
    AppPermission.UPDATE_PRODUCT,
    AppPermission.DELETE_PRODUCT,
    AppPermission.PUBLISH_PRODUCT,
    AppPermission.MANAGE_ROLES,
    AppPermission.VIEW_AUDIT_LOGS,
  ],
  [AppRole.EDITOR]: [
    AppPermission.READ_USERS,
    AppPermission.READ_PRODUCTS,
    AppPermission.CREATE_PRODUCT,
    AppPermission.UPDATE_PRODUCT,
    AppPermission.PUBLISH_PRODUCT,
  ],
  [AppRole.VIEWER]: [AppPermission.READ_USERS, AppPermission.READ_PRODUCTS],
  [AppRole.USER]: [
    // Regular users might only have permissions related to their own data
    // e.g., AppPermission.READ_OWN_PROFILE
  ],
};
