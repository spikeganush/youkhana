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
import { hasPermission, PERMISSIONS, Role } from '@/lib/rbac';
import {
  updateUserRoleSchema,
  updateUserNameSchema,
  deleteUserSchema,
  safeValidate,
} from '@/lib/validations';
import { logUserAction } from '@/lib/audit-log';

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

    // Validate inputs with Zod
    const validationResult = safeValidate(updateUserRoleSchema, {
      email,
      role: newRole,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Prevent non-master admins from creating master admins
    if (validatedData.role === 'MASTER_ADMIN' && currentUser.role !== 'MASTER_ADMIN') {
      return {
        success: false,
        message: 'Only master admins can assign the master admin role',
      };
    }

    // Update the user's role
    await updateUserRole(validatedData.email, validatedData.role as Role);

    // Log the successful action
    await logUserAction(
      'user.update.role',
      currentUser.email!,
      currentUser.role as string,
      validatedData.email,
      'success',
      {
        newRole: validatedData.role,
      }
    );

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User role updated successfully',
    };
  } catch (error) {
    console.error('Error updating user role:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logUserAction(
        'user.update.role',
        currentUser.email!,
        currentUser.role as string,
        email,
        'failure',
        { newRole },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

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

    // Validate inputs with Zod
    const validationResult = safeValidate(updateUserNameSchema, {
      email,
      name: newName,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Update the user's name (already trimmed from validation)
    await updateUserName(validatedData.email, validatedData.name);

    // Log the successful action
    await logUserAction(
      'user.update.name',
      currentUser.email!,
      currentUser.role as string,
      validatedData.email,
      'success',
      {
        newName: validatedData.name,
      }
    );

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User name updated successfully',
    };
  } catch (error) {
    console.error('Error updating user name:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logUserAction(
        'user.update.name',
        currentUser.email!,
        currentUser.role as string,
        email,
        'failure',
        { newName },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

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

    // Validate inputs with Zod
    const validationResult = safeValidate(deleteUserSchema, { email });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedEmail = validationResult.data.email;

    // Prevent users from deleting themselves
    if (validatedEmail === currentUser.email) {
      return {
        success: false,
        message: 'You cannot delete your own account',
      };
    }

    // Delete the user
    await deleteUser(validatedEmail);

    // Log the successful action
    await logUserAction(
      'user.delete',
      currentUser.email!,
      currentUser.role as string,
      validatedEmail,
      'success'
    );

    // Revalidate the users page to show updated data
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logUserAction(
        'user.delete',
        currentUser.email!,
        currentUser.role as string,
        email,
        'failure',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete user',
    };
  }
}
