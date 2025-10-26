/**
 * Role-Based Access Control (RBAC) System
 *
 * This module defines the role hierarchy and permissions for the admin system.
 */

export const ROLES = {
  MASTER_ADMIN: 'MASTER_ADMIN',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Permission definitions for each role
 */
export const PERMISSIONS = {
  // User Management Permissions
  VIEW_USERS: 'VIEW_USERS',
  CREATE_USERS: 'CREATE_USERS',
  UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
  DELETE_USERS: 'DELETE_USERS',

  // Invitation Permissions
  VIEW_INVITATIONS: 'VIEW_INVITATIONS',
  CREATE_INVITATIONS: 'CREATE_INVITATIONS',
  CANCEL_INVITATIONS: 'CANCEL_INVITATIONS',
  RESEND_INVITATIONS: 'RESEND_INVITATIONS',

  // Settings Permissions
  VIEW_SETTINGS: 'VIEW_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',

  // Dashboard Permissions
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',

  // Product Management Permissions
  VIEW_PRODUCTS: 'VIEW_PRODUCTS',
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role to Permissions mapping
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  MASTER_ADMIN: [
    // Master admin has all permissions
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USER_ROLE,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_INVITATIONS,
    PERMISSIONS.CREATE_INVITATIONS,
    PERMISSIONS.CANCEL_INVITATIONS,
    PERMISSIONS.RESEND_INVITATIONS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
  ],
  ADMIN: [
    // Admin can manage users and invitations
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USER_ROLE,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.VIEW_INVITATIONS,
    PERMISSIONS.CREATE_INVITATIONS,
    PERMISSIONS.CANCEL_INVITATIONS,
    PERMISSIONS.RESEND_INVITATIONS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.MANAGE_PRODUCTS,
  ],
  MEMBER: [
    // Member has limited view-only permissions
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_PRODUCTS,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can perform any of the given permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role can perform all of the given permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if a role is an admin (ADMIN or MASTER_ADMIN)
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.MASTER_ADMIN;
}

/**
 * Check if a role is master admin
 */
export function isMasterAdmin(role: Role): boolean {
  return role === ROLES.MASTER_ADMIN;
}

/**
 * Role hierarchy (higher number = more privileged)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  MEMBER: 1,
  ADMIN: 2,
  MASTER_ADMIN: 3,
};

/**
 * Check if roleA has higher or equal privilege than roleB
 */
export function hasHigherOrEqualRole(roleA: Role, roleB: Role): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Validate if a role is a valid role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

/**
 * Get a human-readable label for a role
 */
export function getRoleLabel(role: Role): string {
  switch (role) {
    case ROLES.MASTER_ADMIN:
      return 'Master Admin';
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.MEMBER:
      return 'Member';
    default:
      return 'Unknown';
  }
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  switch (role) {
    case ROLES.MASTER_ADMIN:
      return 'Full system access with all permissions. Can manage all users and settings.';
    case ROLES.ADMIN:
      return 'Can manage users, send invitations, and access most admin features.';
    case ROLES.MEMBER:
      return 'Limited access to view dashboard and settings only.';
    default:
      return '';
  }
}
