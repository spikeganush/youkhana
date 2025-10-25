import { auth } from '@/lib/auth-instance';
import type { Session } from 'next-auth';

/**
 * Get the current session on the server side
 */
export async function getSession(): Promise<Session | null> {
  return await auth();
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if the current user is an admin (ADMIN or MASTER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  const role = session?.user?.role;
  return role === 'ADMIN' || role === 'MASTER_ADMIN';
}

/**
 * Check if the current user is the master admin
 */
export async function isMasterAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === 'MASTER_ADMIN';
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return session;
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const role = session.user?.role;

  if (role !== 'ADMIN' && role !== 'MASTER_ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }

  return session;
}

/**
 * Require master admin role - throws error if not master admin
 */
export async function requireMasterAdmin() {
  const session = await requireAuth();

  if (session.user?.role !== 'MASTER_ADMIN') {
    throw new Error('Forbidden: Master admin access required');
  }

  return session;
}
