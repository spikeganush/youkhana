'use server';

import { revalidatePath } from 'next/cache';
import { updateInquiry, deleteInquiry } from '@/lib/rental-inquiries';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/rbac';
import { RentalInquiryStatus } from '@/types/rental-inquiry';
import { logAction } from '@/lib/audit-log';

/**
 * Update rental inquiry status
 */
export async function updateInquiryStatusAction(
  inquiryId: string,
  status: RentalInquiryStatus
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check permissions (reuse MANAGE_PRODUCTS permission for now)
    if (!hasPermission(currentUser.role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return { success: false, message: 'Insufficient permissions' };
    }

    // Update inquiry
    const updatedInquiry = await updateInquiry(inquiryId, {
      status,
      respondedAt: new Date().toISOString(),
      respondedBy: currentUser.email || undefined,
    });

    // Log action
    await logAction({
      action: 'INQUIRY_STATUS_UPDATE',
      resourceType: 'rental_inquiry',
      resourceId: inquiryId,
      details: {
        newStatus: status,
        inquiryId,
        productTitle: updatedInquiry.productTitle,
        customerEmail: updatedInquiry.customerEmail,
      },
      performedBy: currentUser.email || 'unknown',
    });

    revalidatePath('/admin/rental-inquiries');

    return {
      success: true,
      message: `Inquiry status updated to ${status}`,
    };
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update inquiry status',
    };
  }
}

/**
 * Add notes to rental inquiry
 */
export async function addInquiryNotesAction(
  inquiryId: string,
  notes: string
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check permissions
    if (!hasPermission(currentUser.role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return { success: false, message: 'Insufficient permissions' };
    }

    // Update inquiry
    await updateInquiry(inquiryId, { notes });

    // Log action
    await logAction({
      action: 'INQUIRY_NOTES_UPDATE',
      resourceType: 'rental_inquiry',
      resourceId: inquiryId,
      details: {
        inquiryId,
        notesLength: notes.length,
      },
      performedBy: currentUser.email || 'unknown',
    });

    revalidatePath('/admin/rental-inquiries');

    return {
      success: true,
      message: 'Notes added successfully',
    };
  } catch (error) {
    console.error('Error adding inquiry notes:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add notes',
    };
  }
}

/**
 * Delete rental inquiry
 */
export async function deleteInquiryAction(inquiryId: string) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: 'Unauthorized' };
    }

    // Check permissions (require MANAGE_PRODUCTS permission)
    if (!hasPermission(currentUser.role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return { success: false, message: 'Insufficient permissions' };
    }

    // Delete inquiry
    await deleteInquiry(inquiryId);

    // Log action
    await logAction({
      action: 'INQUIRY_DELETE',
      resourceType: 'rental_inquiry',
      resourceId: inquiryId,
      details: {
        inquiryId,
      },
      performedBy: currentUser.email || 'unknown',
    });

    revalidatePath('/admin/rental-inquiries');

    return {
      success: true,
      message: 'Inquiry deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete inquiry',
    };
  }
}
