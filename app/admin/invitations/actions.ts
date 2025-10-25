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
import { hasPermission, PERMISSIONS, Role } from '@/lib/rbac';
import { sendInvitationEmail as sendInvitationEmailService } from '@/actions/sendEmail';
import {
  createInvitationSchema,
  resendInvitationSchema,
  cancelInvitationSchema,
  safeValidate,
} from '@/lib/validations';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logInvitationAction } from '@/lib/audit-log';

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

    // Validate inputs with Zod
    const validationResult = safeValidate(createInvitationSchema, {
      email,
      role,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      currentUser.email!,
      'invitation_creation',
      RATE_LIMITS.INVITATION_CREATION
    );

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        message: rateLimitResult.error || 'Rate limit exceeded',
      };
    }

    // Create the invitation (email is already lowercase and trimmed from validation)
    const invitation = await createInvitation(
      validatedData.email,
      validatedData.role as Role,
      currentUser.email!
    );

    // Send the invitation email
    await sendInvitationEmail(validatedData.email, invitation.token, validatedData.role as Role);

    // Log the successful action
    await logInvitationAction(
      'invitation.create',
      currentUser.email!,
      currentUser.role as string,
      validatedData.email,
      'success',
      {
        role: validatedData.role,
        token: invitation.token,
      }
    );

    // Revalidate the invitations page
    revalidatePath('/admin/invitations');

    return {
      success: true,
      message: 'Invitation sent successfully',
      data: { token: invitation.token },
    };
  } catch (error) {
    console.error('Error sending invitation:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logInvitationAction(
        'invitation.create',
        currentUser.email!,
        currentUser.role as string,
        email,
        'failure',
        { role },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

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

    // Validate token with Zod
    const validationResult = safeValidate(resendInvitationSchema, { token });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedToken = validationResult.data.token;

    // Get the existing invitation
    const existingInvitation = await getInvitation(validatedToken);
    if (!existingInvitation) {
      return {
        success: false,
        message: 'Invitation not found',
      };
    }

    // Resend (creates new invitation with new token and expiry)
    const newInvitation = await resendInvitation(validatedToken, currentUser.email!);

    // Send the new invitation email
    await sendInvitationEmail(
      newInvitation.email,
      newInvitation.token,
      newInvitation.role
    );

    // Log the successful action
    await logInvitationAction(
      'invitation.resend',
      currentUser.email!,
      currentUser.role as string,
      newInvitation.email,
      'success',
      {
        oldToken: validatedToken,
        newToken: newInvitation.token,
      }
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

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logInvitationAction(
        'invitation.resend',
        currentUser.email!,
        currentUser.role as string,
        token,
        'failure',
        { token },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

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

    // Validate token with Zod
    const validationResult = safeValidate(cancelInvitationSchema, { token });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedToken = validationResult.data.token;

    // Get invitation details before deleting for logging
    const invitation = await getInvitation(validatedToken);
    const invitationEmail = invitation?.email || 'unknown';

    // Delete the invitation
    await deleteInvitation(validatedToken);

    // Log the successful action
    await logInvitationAction(
      'invitation.cancel',
      currentUser.email!,
      currentUser.role as string,
      invitationEmail,
      'success',
      { token: validatedToken }
    );

    // Revalidate the invitations page
    revalidatePath('/admin/invitations');

    return {
      success: true,
      message: 'Invitation cancelled successfully',
    };
  } catch (error) {
    console.error('Error cancelling invitation:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logInvitationAction(
        'invitation.cancel',
        currentUser.email!,
        currentUser.role as string,
        token,
        'failure',
        { token },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel invitation',
    };
  }
}
