'use server';

/**
 * Server Actions for Signup
 */

import { createUser } from '@/lib/redis-auth';
import { markInvitationUsed } from '@/lib/invitations';
import { Role } from '@/lib/rbac';

export type SignupResult = {
  success: boolean;
  message: string;
};

/**
 * Complete the signup process by creating a user account
 */
export async function completeSignupAction(
  email: string,
  name: string,
  role: Role,
  invitedBy: string,
  invitationToken: string
): Promise<SignupResult> {
  try {
    // Validate inputs
    if (!email || !name || !role || !invitationToken) {
      return {
        success: false,
        message: 'Missing required fields',
      };
    }

    if (!name.trim()) {
      return {
        success: false,
        message: 'Name cannot be empty',
      };
    }

    // Create the user account
    await createUser(email, name.trim(), role, invitedBy);

    // Mark the invitation as used
    await markInvitationUsed(invitationToken);

    return {
      success: true,
      message: 'Account created successfully',
    };
  } catch (error) {
    console.error('Error completing signup:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create account',
    };
  }
}
