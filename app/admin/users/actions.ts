'use server';

/**
 * Server Actions for User Management
 *
 * These server actions handle user management operations with proper
 * authentication and authorization checks.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { updateUserRole, deleteUser, updateUserName } from '@/lib/redis-auth';
import { hasPermission, PERMISSIONS, Role, isValidRole } from '@/lib/rbac';

/**
 * Result type for server actions
 */
export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Update a user's role
 */
export async function updateUserRoleAction(
  email: string,
  newRole: Role
): Promise<ActionResult> {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'You must be signed in to perform this action',
      };
    }

    // Check authorization
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.UPDATE_USER_ROLE)) {
      return {
        success: false,
        message: 'You do not have permission to update user roles',
      };
    }

    // Validate role
    if (!isValidRole(newRole)) {
      return {
        success: false,
        message: 'Invalid role specified',
      };
    }

    // Prevent non-master admins from creating master admins
    if (newRole === 'MASTER_ADMIN' && currentUser.role !== 'MASTER_ADMIN') {
      return {
        success: false,
        message: 'Only master admins can assign the master admin role',
      };
    }

    // Update the user's role
    await updateUserRole(email, newRole);

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User role updated successfully',
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user role',
    };
  }
}

/**
 * Update a user's name
 */
export async function updateUserNameAction(
  email: string,
  newName: string
): Promise<ActionResult> {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'You must be signed in to perform this action',
      };
    }

    // Check authorization
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.UPDATE_USER_ROLE)) {
      return {
        success: false,
        message: 'You do not have permission to update users',
      };
    }

    // Validate name
    if (!newName || newName.trim().length === 0) {
      return {
        success: false,
        message: 'Name cannot be empty',
      };
    }

    // Update the user's name
    await updateUserName(email, newName.trim());

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User name updated successfully',
    };
  } catch (error) {
    console.error('Error updating user name:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update user name',
    };
  }
}

/**
 * Delete a user
 */
export async function deleteUserAction(email: string): Promise<ActionResult> {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'You must be signed in to perform this action',
      };
    }

    // Check authorization
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.DELETE_USERS)) {
      return {
        success: false,
        message: 'You do not have permission to delete users',
      };
    }

    // Prevent users from deleting themselves
    if (email === currentUser.email) {
      return {
        success: false,
        message: 'You cannot delete your own account',
      };
    }

    // Delete the user
    await deleteUser(email);

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}
