'use server';

/**
 * Server Actions for Invitation Management
 *
 * These server actions handle invitation operations with proper
 * authentication and authorization checks.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  createInvitation,
  deleteInvitation,
  resendInvitation,
  getInvitation,
} from '@/lib/invitations';
import { hasPermission, PERMISSIONS, Role, isValidRole } from '@/lib/rbac';
import { sendInvitationEmail as sendInvitationEmailService } from '@/actions/sendEmail';

/**
 * Result type for server actions
 */
export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Send an invitation email using the verified email service
 */
async function sendInvitationEmail(
  email: string,
  token: string,
  role: Role
): Promise<void> {
  const invitationUrl = `${process.env.AUTH_URL}/auth/signup/${token}`;
  const expiryDays = process.env.INVITATION_EXPIRY_DAYS || '7';

  const result = await sendInvitationEmailService({
    email,
    invitationUrl,
    role,
    expiryDays,
  });

  if (!result.success) {
    throw new Error('Failed to send invitation email');
  }
}

/**
 * Send a new invitation
 */
export async function sendInvitationAction(
  email: string,
  role: Role
): Promise<ActionResult<{ token: string }>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.CREATE_INVITATIONS)) {
      return {
        success: false,
        message: 'You do not have permission to send invitations',
      };
    }

    // Validate inputs
    if (!email || !email.trim()) {
      return {
        success: false,
        message: 'Email is required',
      };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Invalid email format',
      };
    }

    if (!isValidRole(role)) {
      return {
        success: false,
        message: 'Invalid role specified',
      };
    }

    // Create the invitation
    const invitation = await createInvitation(
      email.trim().toLowerCase(),
      role,
      currentUser.email!
    );

    // Send the invitation email
    await sendInvitationEmail(email.trim().toLowerCase(), invitation.token, role);

    // Revalidate the invitations page
    revalidatePath('/admin/invitations');

    return {
      success: true,
      message: 'Invitation sent successfully',
      data: { token: invitation.token },
    };
  } catch (error) {
    console.error('Error sending invitation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send invitation',
    };
  }
}

/**
 * Resend an existing invitation
 */
export async function resendInvitationAction(
  token: string
): Promise<ActionResult<{ token: string }>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.RESEND_INVITATIONS)) {
      return {
        success: false,
        message: 'You do not have permission to resend invitations',
      };
    }

    // Get the existing invitation
    const existingInvitation = await getInvitation(token);
    if (!existingInvitation) {
      return {
        success: false,
        message: 'Invitation not found',
      };
    }

    // Resend (creates new invitation with new token and expiry)
    const newInvitation = await resendInvitation(token, currentUser.email!);

    // Send the new invitation email
    await sendInvitationEmail(
      newInvitation.email,
      newInvitation.token,
      newInvitation.role
    );

    // Revalidate the invitations page
    revalidatePath('/admin/invitations');

    return {
      success: true,
      message: 'Invitation resent successfully',
      data: { token: newInvitation.token },
    };
  } catch (error) {
    console.error('Error resending invitation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to resend invitation',
    };
  }
}

/**
 * Cancel (delete) an invitation
 */
export async function cancelInvitationAction(
  token: string
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.CANCEL_INVITATIONS)) {
      return {
        success: false,
        message: 'You do not have permission to cancel invitations',
      };
    }

    // Delete the invitation
    await deleteInvitation(token);

    // Revalidate the invitations page
    revalidatePath('/admin/invitations');

    return {
      success: true,
      message: 'Invitation cancelled successfully',
    };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel invitation',
    };
  }
}
