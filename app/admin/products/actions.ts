'use server';

/**
 * Server Actions for Product Management
 *
 * These server actions handle rental product management operations with proper
 * authentication and authorization checks.
 */

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  toggleFeatured,
} from '@/lib/rental-products';
import { hasPermission, PERMISSIONS, Role } from '@/lib/rbac';
import {
  createRentalProductSchema,
  updateRentalProductSchema,
  deleteProductSchema,
  toggleProductStatusSchema,
  safeValidate,
} from '@/lib/validations';
import { logProductAction } from '@/lib/audit-log';
import { RentalProduct, ProductStatus } from '@/types/rental-product';

/**
 * Result type for server actions
 */
export type ActionResult<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Create a new rental product
 */
export async function createProductAction(
  productData: unknown
): Promise<ActionResult<RentalProduct>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return {
        success: false,
        message: 'You do not have permission to create products',
      };
    }

    // Validate inputs with Zod (adding createdBy to the data)
    const validationResult = safeValidate(
      createRentalProductSchema,
      typeof productData === 'object' && productData !== null
        ? { ...productData, createdBy: currentUser.email }
        : { createdBy: currentUser.email }
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Create the product
    const product = await createProduct(validatedData);

    // Log the successful action
    await logProductAction(
      'product.create',
      currentUser.email!,
      currentUser.role as string,
      product.id,
      'success',
      {
        title: product.title,
        category: product.category,
        status: product.status,
      }
    );

    // Revalidate the products page to show updated data
    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product created successfully',
      data: product,
    };
  } catch (error) {
    console.error('Error creating product:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logProductAction(
        'product.create',
        currentUser.email!,
        currentUser.role as string,
        'unknown',
        'failure',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

/**
 * Update an existing rental product
 */
export async function updateProductAction(
  id: string,
  updates: unknown
): Promise<ActionResult<RentalProduct>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return {
        success: false,
        message: 'You do not have permission to update products',
      };
    }

    // Validate inputs with Zod (adding lastModifiedBy to the updates)
    const validationResult = safeValidate(
      updateRentalProductSchema,
      typeof updates === 'object' && updates !== null
        ? { ...updates, lastModifiedBy: currentUser.email }
        : { lastModifiedBy: currentUser.email }
    );

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Update the product
    const product = await updateProduct(id, validatedData);

    // Log the successful action
    await logProductAction(
      'product.update',
      currentUser.email!,
      currentUser.role as string,
      product.id,
      'success',
      {
        title: product.title,
        updates: Object.keys(validatedData),
      }
    );

    // Revalidate the products page to show updated data
    revalidatePath('/admin/products');
    revalidatePath(`/rent/${product.handle}`);

    return {
      success: true,
      message: 'Product updated successfully',
      data: product,
    };
  } catch (error) {
    console.error('Error updating product:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logProductAction(
        'product.update',
        currentUser.email!,
        currentUser.role as string,
        id,
        'failure',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

/**
 * Delete a rental product
 */
export async function deleteProductAction(id: string): Promise<ActionResult> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return {
        success: false,
        message: 'You do not have permission to delete products',
      };
    }

    // Validate inputs with Zod
    const validationResult = safeValidate(deleteProductSchema, { id });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedId = validationResult.data.id;

    // Delete the product
    await deleteProduct(validatedId);

    // Log the successful action
    await logProductAction(
      'product.delete',
      currentUser.email!,
      currentUser.role as string,
      validatedId,
      'success'
    );

    // Revalidate the products page to show updated data
    revalidatePath('/admin/products');
    revalidatePath('/rent');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting product:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logProductAction(
        'product.delete',
        currentUser.email!,
        currentUser.role as string,
        id,
        'failure',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

/**
 * Toggle product status (active/inactive/draft)
 */
export async function toggleProductStatusAction(
  id: string,
  status: ProductStatus
): Promise<ActionResult<RentalProduct>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return {
        success: false,
        message: 'You do not have permission to update product status',
      };
    }

    // Validate inputs with Zod
    const validationResult = safeValidate(toggleProductStatusSchema, {
      id,
      status,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error,
      };
    }

    const validatedData = validationResult.data;

    // Update the product status
    const product = await toggleProductStatus(validatedData.id, validatedData.status);

    // Log the successful action
    await logProductAction(
      'product.status.toggle',
      currentUser.email!,
      currentUser.role as string,
      product.id,
      'success',
      {
        title: product.title,
        newStatus: validatedData.status,
      }
    );

    // Revalidate the products page to show updated data
    revalidatePath('/admin/products');
    revalidatePath('/rent');

    return {
      success: true,
      message: `Product status changed to ${validatedData.status}`,
      data: product,
    };
  } catch (error) {
    console.error('Error toggling product status:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logProductAction(
        'product.status.toggle',
        currentUser.email!,
        currentUser.role as string,
        id,
        'failure',
        { status },
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update product status',
    };
  }
}

/**
 * Toggle product featured status
 */
export async function toggleFeaturedAction(
  id: string
): Promise<ActionResult<RentalProduct>> {
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
    if (!hasPermission(currentUser.role as Role, PERMISSIONS.MANAGE_PRODUCTS)) {
      return {
        success: false,
        message: 'You do not have permission to update product featured status',
      };
    }

    // Toggle featured status
    const product = await toggleFeatured(id);

    // Log the successful action
    await logProductAction(
      'product.featured.toggle',
      currentUser.email!,
      currentUser.role as string,
      product.id,
      'success',
      {
        title: product.title,
        featured: product.featured,
      }
    );

    // Revalidate the products page to show updated data
    revalidatePath('/admin/products');
    revalidatePath('/rent');

    return {
      success: true,
      message: product.featured
        ? 'Product marked as featured'
        : 'Product unmarked as featured',
      data: product,
    };
  } catch (error) {
    console.error('Error toggling featured status:', error);

    // Log the failed action
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await logProductAction(
        'product.featured.toggle',
        currentUser.email!,
        currentUser.role as string,
        id,
        'failure',
        undefined,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update featured status',
    };
  }
}
