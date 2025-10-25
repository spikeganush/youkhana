/**
 * Redis User Operations
 *
 * This module handles all user-related CRUD operations with Redis.
 */

import { redis } from "./redist";
import { Role, isValidRole } from "./rbac";

export interface User {
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  invitedBy: string | null;
  lastSignIn?: string;
}

/**
 * Create a new user in Redis
 */
export async function createUser(
  email: string,
  name: string,
  role: Role,
  invitedBy: string | null = null
): Promise<User> {
  // Validate inputs
  if (!email || !name || !role) {
    throw new Error("Email, name, and role are required");
  }

  if (!isValidRole(role)) {
    throw new Error("Invalid role");
  }

  // Check if user already exists
  const existingUser = await getUser(email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user: User = {
    email,
    name,
    role,
    createdAt: new Date().toISOString(),
    invitedBy,
  };

  // Store user in Redis
  await redis.hset(`user:${email}`, user as unknown as Record<string, string>);

  // Add email to the users:all set for indexing
  await redis.sadd("users:all", email);

  return user;
}

/**
 * Get a user by email
 */
export async function getUser(email: string): Promise<User | null> {
  if (!email) {
    return null;
  }

  const userData = await redis.hgetall(`user:${email}`);

  if (!userData || Object.keys(userData).length === 0) {
    return null;
  }

  return userData as unknown as User;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  // Get all user emails from the index
  const userEmails = await redis.smembers("users:all");

  if (!userEmails || userEmails.length === 0) {
    return [];
  }

  // Fetch all users in parallel
  const users = await Promise.all(
    userEmails.map(async (email) => {
      const user = await getUser(email);
      return user;
    })
  );

  // Filter out null values and sort by creation date (newest first)
  return users
    .filter((user): user is User => user !== null)
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

/**
 * Update a user's role
 */
export async function updateUserRole(
  email: string,
  newRole: Role
): Promise<User> {
  if (!email || !newRole) {
    throw new Error("Email and new role are required");
  }

  if (!isValidRole(newRole)) {
    throw new Error("Invalid role");
  }

  // Get existing user
  const user = await getUser(email);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent changing master admin role (if you want this protection)
  const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
  if (email === masterAdminEmail && newRole !== "MASTER_ADMIN") {
    throw new Error("Cannot change master admin role");
  }

  // Update the role
  await redis.hset(`user:${email}`, { role: newRole });

  return {
    ...user,
    role: newRole,
  };
}

/**
 * Update user's last sign-in timestamp
 */
export async function updateLastSignIn(email: string): Promise<void> {
  if (!email) {
    return;
  }

  const user = await getUser(email);
  if (!user) {
    return;
  }

  await redis.hset(`user:${email}`, {
    lastSignIn: new Date().toISOString(),
  });
}

/**
 * Update user's name
 */
export async function updateUserName(
  email: string,
  newName: string
): Promise<User> {
  if (!email || !newName) {
    throw new Error("Email and new name are required");
  }

  const user = await getUser(email);
  if (!user) {
    throw new Error("User not found");
  }

  await redis.hset(`user:${email}`, { name: newName });

  return {
    ...user,
    name: newName,
  };
}

/**
 * Delete a user
 */
export async function deleteUser(email: string): Promise<void> {
  if (!email) {
    throw new Error("Email is required");
  }

  // Prevent deleting master admin
  const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
  if (email === masterAdminEmail) {
    throw new Error("Cannot delete master admin");
  }

  // Check if user exists
  const user = await getUser(email);
  if (!user) {
    throw new Error("User not found");
  }

  // Delete user from Redis
  await redis.del(`user:${email}`);

  // Remove email from the users:all set
  await redis.srem("users:all", email);
}

/**
 * Check if a user exists
 */
export async function userExists(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }

  const user = await getUser(email);
  return user !== null;
}

/**
 * Get total user count
 */
export async function getUserCount(): Promise<number> {
  const userEmails = await redis.smembers("users:all");
  return userEmails?.length || 0;
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: Role): Promise<User[]> {
  if (!isValidRole(role)) {
    throw new Error("Invalid role");
  }

  const allUsers = await getAllUsers();
  return allUsers.filter((user) => user.role === role);
}
