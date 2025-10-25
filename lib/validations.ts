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
