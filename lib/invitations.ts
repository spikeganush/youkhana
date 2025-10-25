/**
 * Invitation System Operations
 *
 * This module handles all invitation-related CRUD operations with Redis.
 */

import { redis } from "./redist";
import { Role, isValidRole, ROLES } from "./rbac";
import { userExists } from "./redis-auth";
import { randomBytes } from "crypto";

export type InvitationStatus = "pending" | "used" | "expired";

export interface Invitation {
  email: string;
  role: Role;
  token: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  status: InvitationStatus;
  usedAt?: string;
}

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get the invitation expiry date based on environment variable
 */
function getExpiryDate(): string {
  const expiryDays = parseInt(process.env.INVITATION_EXPIRY_DAYS || "7", 10);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return expiryDate.toISOString();
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  email: string,
  role: Role,
  createdBy: string
): Promise<Invitation> {
  // Validate inputs
  if (!email || !role || !createdBy) {
    throw new Error("Email, role, and createdBy are required");
  }

  if (!isValidRole(role)) {
    throw new Error("Invalid role");
  }

  // Cannot invite MASTER_ADMIN (only one master admin allowed)
  if (role === ROLES.MASTER_ADMIN) {
    throw new Error("Cannot invite master admin through invitation system");
  }

  // Check if user already exists
  const exists = await userExists(email);
  if (exists) {
    throw new Error("User with this email already exists");
  }

  // Check if there's already a pending invitation for this email
  const existingInvitation = await getPendingInvitationByEmail(email);
  if (existingInvitation) {
    throw new Error("Pending invitation already exists for this email");
  }

  const token = generateInvitationToken();
  const invitation: Invitation = {
    email,
    role,
    token,
    expiresAt: getExpiryDate(),
    createdBy,
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  // Store invitation in Redis
  await redis.hset(
    `invitation:${token}`,
    invitation as unknown as Record<string, string>
  );

  // Add token to pending invitations set
  await redis.sadd("invitations:pending", token);

  // Create an index by email for easy lookup
  await redis.set(`invitation:email:${email}`, token);

  return invitation;
}

/**
 * Get an invitation by token
 */
export async function getInvitation(
  token: string
): Promise<Invitation | null> {
  if (!token) {
    return null;
  }

  const invitationData = await redis.hgetall(`invitation:${token}`);

  if (!invitationData || Object.keys(invitationData).length === 0) {
    return null;
  }

  return invitationData as unknown as Invitation;
}

/**
 * Get a pending invitation by email
 */
export async function getPendingInvitationByEmail(
  email: string
): Promise<Invitation | null> {
  if (!email) {
    return null;
  }

  const token = await redis.get(`invitation:email:${email}`);
  if (!token) {
    return null;
  }

  const invitation = await getInvitation(token as string);
  if (!invitation || invitation.status !== "pending") {
    return null;
  }

  return invitation;
}

/**
 * Get all pending invitations
 */
export async function getPendingInvitations(): Promise<Invitation[]> {
  // Get all pending invitation tokens
  const tokens = await redis.smembers("invitations:pending");

  if (!tokens || tokens.length === 0) {
    return [];
  }

  // Fetch all invitations in parallel
  const invitations = await Promise.all(
    tokens.map(async (token) => {
      const invitation = await getInvitation(token);
      return invitation;
    })
  );

  // Filter out null values and sort by creation date (newest first)
  const validInvitations = invitations
    .filter((invitation): invitation is Invitation => invitation !== null)
    .filter((invitation) => invitation.status === "pending");

  // Check for expired invitations and update their status
  const now = new Date();
  const updatedInvitations = await Promise.all(
    validInvitations.map(async (invitation) => {
      if (new Date(invitation.expiresAt) < now && invitation.status === "pending") {
        await markInvitationExpired(invitation.token);
        return { ...invitation, status: "expired" as InvitationStatus };
      }
      return invitation;
    })
  );

  // Filter out expired invitations and sort
  return updatedInvitations
    .filter((invitation) => invitation.status === "pending")
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Get all invitations (including used and expired)
 */
export async function getAllInvitations(): Promise<Invitation[]> {
  // This is a simplified version - in a real system you'd want a better index
  // For now, we'll just get pending invitations
  // You could extend this to store all invitations in a separate set
  return getPendingInvitations();
}

/**
 * Mark an invitation as used
 */
export async function markInvitationUsed(token: string): Promise<void> {
  if (!token) {
    throw new Error("Token is required");
  }

  const invitation = await getInvitation(token);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Update invitation status
  await redis.hset(`invitation:${token}`, {
    status: "used",
    usedAt: new Date().toISOString(),
  });

  // Remove from pending set
  await redis.srem("invitations:pending", token);

  // Remove email index
  await redis.del(`invitation:email:${invitation.email}`);
}

/**
 * Mark an invitation as expired
 */
export async function markInvitationExpired(token: string): Promise<void> {
  if (!token) {
    throw new Error("Token is required");
  }

  const invitation = await getInvitation(token);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Update invitation status
  await redis.hset(`invitation:${token}`, {
    status: "expired",
  });

  // Remove from pending set
  await redis.srem("invitations:pending", token);

  // Remove email index
  await redis.del(`invitation:email:${invitation.email}`);
}

/**
 * Delete (cancel) an invitation
 */
export async function deleteInvitation(token: string): Promise<void> {
  if (!token) {
    throw new Error("Token is required");
  }

  const invitation = await getInvitation(token);
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Delete invitation from Redis
  await redis.del(`invitation:${token}`);

  // Remove from pending set
  await redis.srem("invitations:pending", token);

  // Remove email index
  await redis.del(`invitation:email:${invitation.email}`);
}

/**
 * Validate an invitation token
 * Returns the invitation if valid, null if invalid/expired
 */
export async function validateInvitationToken(
  token: string
): Promise<Invitation | null> {
  if (!token) {
    return null;
  }

  const invitation = await getInvitation(token);
  if (!invitation) {
    return null;
  }

  // Check if invitation is already used
  if (invitation.status === "used") {
    return null;
  }

  // Check if invitation is expired
  const now = new Date();
  if (new Date(invitation.expiresAt) < now) {
    // Mark as expired
    await markInvitationExpired(token);
    return null;
  }

  // Check if user already exists (someone might have been invited twice)
  const exists = await userExists(invitation.email);
  if (exists) {
    return null;
  }

  return invitation;
}

/**
 * Clean up expired invitations
 * This should be called periodically (e.g., via a cron job)
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  const pendingInvitations = await getPendingInvitations();
  const now = new Date();
  let cleanedCount = 0;

  for (const invitation of pendingInvitations) {
    if (new Date(invitation.expiresAt) < now) {
      await markInvitationExpired(invitation.token);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

/**
 * Get count of pending invitations
 */
export async function getPendingInvitationsCount(): Promise<number> {
  const tokens = await redis.smembers("invitations:pending");

  if (!tokens || tokens.length === 0) {
    return 0;
  }

  // Filter out expired invitations
  const validInvitations = await Promise.all(
    tokens.map(async (token) => {
      const invitation = await getInvitation(token);
      if (!invitation) return null;

      const now = new Date();
      if (new Date(invitation.expiresAt) < now) {
        await markInvitationExpired(token);
        return null;
      }

      return invitation;
    })
  );

  return validInvitations.filter(inv => inv !== null).length;
}

/**
 * Resend an invitation (creates a new token with new expiry)
 */
export async function resendInvitation(
  oldToken: string,
  resendBy: string
): Promise<Invitation> {
  if (!oldToken) {
    throw new Error("Token is required");
  }

  const oldInvitation = await getInvitation(oldToken);
  if (!oldInvitation) {
    throw new Error("Invitation not found");
  }

  // Delete old invitation
  await deleteInvitation(oldToken);

  // Create new invitation with same details
  return createInvitation(oldInvitation.email, oldInvitation.role, resendBy);
}
