/**
 * Audit Logging System
 *
 * This module provides comprehensive audit logging for all admin actions.
 * Logs are stored in Redis with a configurable TTL for compliance and debugging.
 */

import { redis } from './redist';

/**
 * Audit log entry interface
 */
export interface AuditLog {
  /**
   * Unique log ID
   */
  id: string;

  /**
   * Timestamp of the action (ISO string)
   */
  timestamp: string;

  /**
   * Email of the user who performed the action
   */
  performedBy: string;

  /**
   * Role of the user who performed the action
   */
  performedByRole: string;

  /**
   * Type of action performed
   */
  action: AuditAction;

  /**
   * Category of the action
   */
  category: AuditCategory;

  /**
   * Resource affected (e.g., user email, invitation token)
   */
  resource: string;

  /**
   * Additional details about the action
   */
  details?: Record<string, unknown>;

  /**
   * Result of the action
   */
  result: 'success' | 'failure';

  /**
   * Error message if action failed
   */
  errorMessage?: string;

  /**
   * IP address of the user (optional)
   */
  ipAddress?: string;

  /**
   * User agent (optional)
   */
  userAgent?: string;
}

/**
 * Audit action types
 */
export type AuditAction =
  // User management actions
  | 'user.create'
  | 'user.update.role'
  | 'user.update.name'
  | 'user.delete'
  // Invitation actions
  | 'invitation.create'
  | 'invitation.resend'
  | 'invitation.cancel'
  | 'invitation.accept'
  // Auth actions
  | 'auth.signin'
  | 'auth.signout'
  | 'auth.signup'
  // Settings actions
  | 'settings.update';

/**
 * Audit category for grouping
 */
export type AuditCategory =
  | 'user_management'
  | 'invitation_management'
  | 'authentication'
  | 'settings';

/**
 * Configuration for audit logs
 */
const AUDIT_CONFIG = {
  /**
   * TTL for audit logs in seconds (90 days)
   */
  TTL_SECONDS: 90 * 24 * 60 * 60,

  /**
   * Maximum number of logs to return in a query
   */
  MAX_QUERY_LIMIT: 100,
};

/**
 * Generate a unique audit log ID
 */
function generateLogId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `audit_${timestamp}_${random}`;
}

/**
 * Log an audit event
 *
 * @param log - Audit log entry (without id and timestamp)
 * @returns The created audit log entry
 */
export async function logAuditEvent(
  log: Omit<AuditLog, 'id' | 'timestamp'>
): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    ...log,
  };

  try {
    // Store the log in Redis with TTL
    const key = `auditlog:${auditLog.id}`;
    await redis.setex(key, AUDIT_CONFIG.TTL_SECONDS, JSON.stringify(auditLog));

    // Add to category-specific sorted set (for querying)
    const categoryKey = `auditlogs:${log.category}`;
    const score = Date.now(); // Use timestamp as score for sorting
    await redis.zadd(categoryKey, { score, member: auditLog.id });

    // Set TTL on the sorted set as well
    await redis.expire(categoryKey, AUDIT_CONFIG.TTL_SECONDS);

    // Add to user-specific sorted set
    const userKey = `auditlogs:user:${log.performedBy}`;
    await redis.zadd(userKey, { score, member: auditLog.id });
    await redis.expire(userKey, AUDIT_CONFIG.TTL_SECONDS);

    // Add to global sorted set
    const globalKey = 'auditlogs:all';
    await redis.zadd(globalKey, { score, member: auditLog.id });
    await redis.expire(globalKey, AUDIT_CONFIG.TTL_SECONDS);

    return auditLog;
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the application
    return auditLog;
  }
}

/**
 * Get recent audit logs
 *
 * @param limit - Maximum number of logs to return
 * @param category - Optional category filter
 * @param userEmail - Optional user filter
 * @returns Array of audit logs
 */
export async function getAuditLogs(
  limit: number = 50,
  category?: AuditCategory,
  userEmail?: string
): Promise<AuditLog[]> {
  try {
    const safeLimit = Math.min(limit, AUDIT_CONFIG.MAX_QUERY_LIMIT);

    // Determine which sorted set to query
    let key: string;
    if (userEmail) {
      key = `auditlogs:user:${userEmail}`;
    } else if (category) {
      key = `auditlogs:${category}`;
    } else {
      key = 'auditlogs:all';
    }

    // Get the most recent log IDs (highest scores = most recent)
    const logIds = await redis.zrange(key, 0, safeLimit - 1, { rev: true });

    if (!logIds || logIds.length === 0) {
      return [];
    }

    // Fetch the actual log entries
    const logs: AuditLog[] = [];
    for (const logId of logIds) {
      const logKey = `auditlog:${logId}`;
      const logData = await redis.get(logKey);

      if (logData) {
        try {
          const log = JSON.parse(logData as string) as AuditLog;
          logs.push(log);
        } catch (parseError) {
          console.error('Failed to parse audit log:', parseError);
        }
      }
    }

    return logs;
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific action type
 *
 * @param action - Action type to filter by
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export async function getAuditLogsByAction(
  action: AuditAction,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const allLogs = await getAuditLogs(AUDIT_CONFIG.MAX_QUERY_LIMIT);
    const filteredLogs = allLogs.filter((log) => log.action === action);

    return filteredLogs.slice(0, limit);
  } catch (error) {
    console.error('Failed to get audit logs by action:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific resource
 *
 * @param resource - Resource identifier (e.g., email)
 * @param limit - Maximum number of logs to return
 * @returns Array of audit logs
 */
export async function getAuditLogsByResource(
  resource: string,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    const allLogs = await getAuditLogs(AUDIT_CONFIG.MAX_QUERY_LIMIT);
    const filteredLogs = allLogs.filter((log) => log.resource === resource);

    return filteredLogs.slice(0, limit);
  } catch (error) {
    console.error('Failed to get audit logs by resource:', error);
    return [];
  }
}

/**
 * Get a single audit log by ID
 *
 * @param logId - Audit log ID
 * @returns Audit log or null if not found
 */
export async function getAuditLog(logId: string): Promise<AuditLog | null> {
  try {
    const key = `auditlog:${logId}`;
    const logData = await redis.get(key);

    if (!logData) {
      return null;
    }

    return JSON.parse(logData as string) as AuditLog;
  } catch (error) {
    console.error('Failed to get audit log:', error);
    return null;
  }
}

/**
 * Delete old audit logs (for manual cleanup if needed)
 * Note: Logs automatically expire based on TTL
 *
 * @param olderThanDays - Delete logs older than this many days
 * @returns Number of logs deleted
 */
export async function cleanupOldAuditLogs(
  olderThanDays: number
): Promise<number> {
  try {
    const cutoffTimestamp = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    // Get all log IDs older than cutoff
    const oldLogIds = await redis.zrange(
      'auditlogs:all',
      0,
      cutoffTimestamp,
      { byScore: true }
    );

    if (!oldLogIds || oldLogIds.length === 0) {
      return 0;
    }

    // Delete the log entries
    for (const logId of oldLogIds) {
      await redis.del(`auditlog:${logId}`);
    }

    // Remove from sorted sets
    await redis.zremrangebyscore('auditlogs:all', 0, cutoffTimestamp);

    return oldLogIds.length;
  } catch (error) {
    console.error('Failed to cleanup old audit logs:', error);
    return 0;
  }
}

/**
 * Helper function to create audit log for user management actions
 */
export async function logUserAction(
  action: Extract<
    AuditAction,
    'user.create' | 'user.update.role' | 'user.update.name' | 'user.delete'
  >,
  performedBy: string,
  performedByRole: string,
  resource: string,
  result: 'success' | 'failure',
  details?: Record<string, unknown>,
  errorMessage?: string
): Promise<AuditLog> {
  return logAuditEvent({
    performedBy,
    performedByRole,
    action,
    category: 'user_management',
    resource,
    result,
    details,
    errorMessage,
  });
}

/**
 * Helper function to create audit log for invitation actions
 */
export async function logInvitationAction(
  action: Extract<
    AuditAction,
    'invitation.create' | 'invitation.resend' | 'invitation.cancel' | 'invitation.accept'
  >,
  performedBy: string,
  performedByRole: string,
  resource: string,
  result: 'success' | 'failure',
  details?: Record<string, unknown>,
  errorMessage?: string
): Promise<AuditLog> {
  return logAuditEvent({
    performedBy,
    performedByRole,
    action,
    category: 'invitation_management',
    resource,
    result,
    details,
    errorMessage,
  });
}

/**
 * Helper function to create audit log for auth actions
 */
export async function logAuthAction(
  action: Extract<AuditAction, 'auth.signin' | 'auth.signout' | 'auth.signup'>,
  performedBy: string,
  performedByRole: string,
  result: 'success' | 'failure',
  details?: Record<string, unknown>,
  errorMessage?: string
): Promise<AuditLog> {
  return logAuditEvent({
    performedBy,
    performedByRole,
    action,
    category: 'authentication',
    resource: performedBy,
    result,
    details,
    errorMessage,
  });
}
