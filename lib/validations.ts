/**
 * Input Validation Schemas
 *
 * This module contains Zod schemas for validating all user inputs
 * across the admin system.
 */

import { z } from 'zod';
import { ROLES } from './rbac';

/**
 * Email validation schema
 * - Must be valid email format
 * - Converted to lowercase
 * - Trimmed of whitespace
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .transform((val) => val.trim());

/**
 * Name validation schema
 * - Minimum 1 character
 * - Maximum 100 characters
 * - Trimmed of whitespace
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .transform((val) => val.trim());

/**
 * Role validation schema
 * - Must be one of the valid roles
 */
export const roleSchema = z.enum([
  ROLES.MASTER_ADMIN,
  ROLES.ADMIN,
  ROLES.MEMBER,
] as [string, ...string[]]);

/**
 * Invitation role schema
 * - Cannot be MASTER_ADMIN (must be invited manually)
 */
export const invitationRoleSchema = z.enum([ROLES.ADMIN, ROLES.MEMBER] as [
  string,
  ...string[],
]);

/**
 * Token validation schema
 * - Must be 64 character hex string
 */
export const tokenSchema = z
  .string()
  .length(64, 'Invalid token format')
  .regex(/^[a-f0-9]{64}$/, 'Invalid token format');

/**
 * User creation schema
 */
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: roleSchema,
  invitedBy: emailSchema.optional(),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  role: roleSchema.optional(),
});

/**
 * User role update schema
 */
export const updateUserRoleSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});

/**
 * User name update schema
 */
export const updateUserNameSchema = z.object({
  email: emailSchema,
  name: nameSchema,
});

/**
 * User deletion schema
 */
export const deleteUserSchema = z.object({
  email: emailSchema,
});

/**
 * Create invitation schema
 */
export const createInvitationSchema = z.object({
  email: emailSchema,
  role: invitationRoleSchema,
});

/**
 * Resend invitation schema
 */
export const resendInvitationSchema = z.object({
  token: tokenSchema,
});

/**
 * Cancel invitation schema
 */
export const cancelInvitationSchema = z.object({
  token: tokenSchema,
});

/**
 * Signup schema
 */
export const signupSchema = z.object({
  token: tokenSchema,
  name: nameSchema,
  email: emailSchema,
});

/**
 * Validation helper function
 * Returns parsed data if valid, throws error if invalid
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * Safe validation helper function
 * Returns { success: true, data } if valid
 * Returns { success: false, error } if invalid
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Extract first error message
  const errorMessage =
    result.error.issues[0]?.message || 'Validation failed';

  return { success: false, error: errorMessage };
}

/**
 * Product handle validation schema
 * - Must be URL-safe (lowercase letters, numbers, hyphens)
 * - No spaces or special characters
 */
export const handleSchema = z
  .string()
  .min(1, 'Handle is required')
  .max(100, 'Handle must be less than 100 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Handle must only contain lowercase letters, numbers, and hyphens'
  )
  .transform((val) => val.trim().toLowerCase());

/**
 * Product title validation schema
 */
export const productTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')
  .transform((val) => val.trim());

/**
 * Product description validation schema
 */
export const productDescriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(5000, 'Description must be less than 5000 characters')
  .transform((val) => val.trim());

/**
 * Product short description validation schema
 */
export const productShortDescriptionSchema = z
  .string()
  .max(150, 'Short description must be less than 150 characters')
  .transform((val) => val.trim())
  .optional();

/**
 * Rental price validation schema
 */
export const rentalPriceSchema = z.object({
  daily: z.number().positive('Daily price must be positive'),
  weekly: z.number().positive('Weekly price must be positive').optional(),
  monthly: z.number().positive('Monthly price must be positive').optional(),
});

/**
 * Product image validation schema
 */
export const productImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  pathname: z.string().min(1, 'Image pathname is required'),
  alt: z.string().min(1, 'Image alt text is required'),
  order: z.number().int().min(0, 'Image order must be 0 or greater'),
});

/**
 * Product status validation schema
 */
export const productStatusSchema = z.enum(['active', 'inactive', 'draft']);

/**
 * Product category validation schema
 */
export const productCategorySchema = z
  .string()
  .min(1, 'Category is required')
  .max(50, 'Category must be less than 50 characters')
  .transform((val) => val.trim());

/**
 * Create rental product schema
 */
export const createRentalProductSchema = z.object({
  handle: handleSchema.optional(),
  title: productTitleSchema,
  description: productDescriptionSchema,
  shortDescription: productShortDescriptionSchema,
  rentalPrice: rentalPriceSchema,
  deposit: z.number().min(0, 'Deposit cannot be negative').optional(),
  currency: z.string().default('USD'),
  totalQuantity: z.number().int().min(0, 'Total quantity cannot be negative'),
  availableQuantity: z
    .number()
    .int()
    .min(0, 'Available quantity cannot be negative'),
  images: z.array(productImageSchema).default([]),
  category: productCategorySchema,
  tags: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).optional(),
  terms: z.string().optional(),
  minRentalDays: z
    .number()
    .int()
    .positive('Minimum rental days must be positive')
    .optional(),
  maxRentalDays: z
    .number()
    .int()
    .positive('Maximum rental days must be positive')
    .optional(),
  status: productStatusSchema.default('draft'),
  featured: z.boolean().default(false),
  createdBy: emailSchema,
}).refine(
  (data) => data.availableQuantity <= data.totalQuantity,
  {
    message: 'Available quantity cannot exceed total quantity',
    path: ['availableQuantity'],
  }
).refine(
  (data) => {
    if (data.minRentalDays && data.maxRentalDays) {
      return data.minRentalDays <= data.maxRentalDays;
    }
    return true;
  },
  {
    message: 'Minimum rental days cannot exceed maximum rental days',
    path: ['minRentalDays'],
  }
);

/**
 * Update rental product schema
 * All fields are optional except those being updated
 */
export const updateRentalProductSchema = z.object({
  handle: handleSchema.optional(),
  title: productTitleSchema.optional(),
  description: productDescriptionSchema.optional(),
  shortDescription: productShortDescriptionSchema,
  rentalPrice: rentalPriceSchema.optional(),
  deposit: z.number().min(0, 'Deposit cannot be negative').optional(),
  currency: z.string().optional(),
  totalQuantity: z.number().int().min(0, 'Total quantity cannot be negative').optional(),
  availableQuantity: z
    .number()
    .int()
    .min(0, 'Available quantity cannot be negative')
    .optional(),
  images: z.array(productImageSchema).optional(),
  category: productCategorySchema.optional(),
  tags: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  terms: z.string().optional(),
  minRentalDays: z
    .number()
    .int()
    .positive('Minimum rental days must be positive')
    .optional(),
  maxRentalDays: z
    .number()
    .int()
    .positive('Maximum rental days must be positive')
    .optional(),
  status: productStatusSchema.optional(),
  featured: z.boolean().optional(),
  lastModifiedBy: emailSchema.optional(),
});

/**
 * Delete product schema
 */
export const deleteProductSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

/**
 * Toggle product status schema
 */
export const toggleProductStatusSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
  status: productStatusSchema,
});
