/**
 * Rental Inquiries Redis Operations
 *
 * This module handles all rental inquiry CRUD operations with Redis.
 * Inquiries are stored and tracked for admin management.
 */

import { redis } from "./redist";
import {
  RentalInquiry,
  CreateRentalInquiryInput,
  UpdateRentalInquiryInput,
  RentalInquiryFilters,
  InquiryStats,
  INQUIRY_REDIS_KEYS,
} from "@/types/rental-inquiry";
import { randomUUID } from "crypto";

/**
 * Create a new rental inquiry
 */
export async function createRentalInquiry(
  input: CreateRentalInquiryInput
): Promise<RentalInquiry> {
  // Validate required fields
  if (!input.customerName || !input.customerEmail) {
    throw new Error("Customer name and email are required");
  }

  if (!input.productId || !input.productTitle) {
    throw new Error("Product information is required");
  }

  const id = randomUUID();
  const now = new Date().toISOString();

  const inquiry: RentalInquiry = {
    ...input,
    id,
    status: input.status || 'pending',
    createdAt: now,
    updatedAt: now,
  };

  // Store inquiry in Redis as JSON string
  await redis.set(INQUIRY_REDIS_KEYS.inquiry(id), JSON.stringify(inquiry));

  // Add to sorted set (score = timestamp for chronological ordering)
  await redis.zadd(INQUIRY_REDIS_KEYS.allInquiries, {
    score: Date.now(),
    member: id,
  });

  // Add to pending inquiries set if status is pending
  if (inquiry.status === 'pending') {
    await redis.sadd(INQUIRY_REDIS_KEYS.pendingInquiries, id);
  }

  // Add to product-specific inquiries
  await redis.sadd(INQUIRY_REDIS_KEYS.productInquiries(input.productId), id);

  // Add to customer-specific inquiries
  await redis.sadd(INQUIRY_REDIS_KEYS.customerInquiries(input.customerEmail), id);

  return inquiry;
}

/**
 * Get an inquiry by ID
 */
export async function getInquiry(id: string): Promise<RentalInquiry | null> {
  if (!id) {
    return null;
  }

  const inquiryData = await redis.get(INQUIRY_REDIS_KEYS.inquiry(id));

  if (!inquiryData) {
    return null;
  }

  // Handle both cases: Redis returning a string OR an already-parsed object
  let inquiry: RentalInquiry;
  if (typeof inquiryData === 'string') {
    inquiry = JSON.parse(inquiryData);
  } else {
    inquiry = inquiryData as RentalInquiry;
  }

  return inquiry;
}

/**
 * Get all inquiries with optional filters
 */
export async function getAllInquiries(
  filters?: RentalInquiryFilters
): Promise<RentalInquiry[]> {
  let inquiryIds: string[] = [];

  // Determine which set to query based on filters
  if (filters?.status === 'pending') {
    const ids = await redis.smembers(INQUIRY_REDIS_KEYS.pendingInquiries);
    if (Array.isArray(ids)) {
      inquiryIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else if (filters?.productId) {
    const ids = await redis.smembers(
      INQUIRY_REDIS_KEYS.productInquiries(filters.productId)
    );
    if (Array.isArray(ids)) {
      inquiryIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else if (filters?.customerEmail) {
    const ids = await redis.smembers(
      INQUIRY_REDIS_KEYS.customerInquiries(filters.customerEmail)
    );
    if (Array.isArray(ids)) {
      inquiryIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else {
    // Get all inquiries from sorted set (newest first)
    const ids = await redis.zrange(INQUIRY_REDIS_KEYS.allInquiries, 0, -1, {
      rev: true,
    });

    if (Array.isArray(ids)) {
      inquiryIds = ids.filter((id): id is string => typeof id === 'string');
    }
  }

  if (inquiryIds.length === 0) {
    return [];
  }

  // Fetch all inquiries in parallel
  const inquiries = await Promise.all(
    inquiryIds.map(async (id) => {
      const inquiry = await getInquiry(id);
      return inquiry;
    })
  );

  // Filter out null values
  let filteredInquiries = inquiries.filter(
    (inquiry): inquiry is RentalInquiry => inquiry !== null
  );

  // Apply additional filters
  if (filters) {
    if (filters.status && filters.status !== 'pending') {
      filteredInquiries = filteredInquiries.filter(
        (i) => i.status === filters.status
      );
    }

    if (filters.startDate) {
      filteredInquiries = filteredInquiries.filter(
        (i) => i.createdAt >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredInquiries = filteredInquiries.filter(
        (i) => i.createdAt <= filters.endDate!
      );
    }
  }

  return filteredInquiries;
}

/**
 * Update an inquiry
 */
export async function updateInquiry(
  id: string,
  updates: UpdateRentalInquiryInput
): Promise<RentalInquiry> {
  if (!id) {
    throw new Error("Inquiry ID is required");
  }

  // Get existing inquiry
  const existingInquiry = await getInquiry(id);
  if (!existingInquiry) {
    throw new Error("Inquiry not found");
  }

  const updatedInquiry: RentalInquiry = {
    ...existingInquiry,
    ...updates,
    id, // Ensure ID doesn't change
    createdAt: existingInquiry.createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  // Update inquiry in Redis as JSON string
  await redis.set(INQUIRY_REDIS_KEYS.inquiry(id), JSON.stringify(updatedInquiry));

  // Update status-specific sets if status changed
  if (updates.status && updates.status !== existingInquiry.status) {
    if (existingInquiry.status === 'pending') {
      await redis.srem(INQUIRY_REDIS_KEYS.pendingInquiries, id);
    }
    if (updates.status === 'pending') {
      await redis.sadd(INQUIRY_REDIS_KEYS.pendingInquiries, id);
    }
  }

  return updatedInquiry;
}

/**
 * Delete an inquiry
 */
export async function deleteInquiry(id: string): Promise<void> {
  if (!id) {
    throw new Error("Inquiry ID is required");
  }

  const inquiry = await getInquiry(id);
  if (!inquiry) {
    throw new Error("Inquiry not found");
  }

  // Delete inquiry from Redis
  await redis.del(INQUIRY_REDIS_KEYS.inquiry(id));

  // Remove from sorted set
  await redis.zrem(INQUIRY_REDIS_KEYS.allInquiries, id);

  // Remove from pending inquiries set
  await redis.srem(INQUIRY_REDIS_KEYS.pendingInquiries, id);

  // Remove from product-specific inquiries
  await redis.srem(INQUIRY_REDIS_KEYS.productInquiries(inquiry.productId), id);

  // Remove from customer-specific inquiries
  await redis.srem(INQUIRY_REDIS_KEYS.customerInquiries(inquiry.customerEmail), id);
}

/**
 * Get inquiry statistics for admin dashboard
 */
export async function getInquiryStats(): Promise<InquiryStats> {
  const allInquiries = await getAllInquiries();

  const stats: InquiryStats = {
    total: allInquiries.length,
    pending: allInquiries.filter((i) => i.status === 'pending').length,
    contacted: allInquiries.filter((i) => i.status === 'contacted').length,
    confirmed: allInquiries.filter((i) => i.status === 'confirmed').length,
    cancelled: allInquiries.filter((i) => i.status === 'cancelled').length,
    completed: allInquiries.filter((i) => i.status === 'completed').length,
    byProduct: {},
    recentInquiries: [],
  };

  // Calculate inquiries by product
  for (const inquiry of allInquiries) {
    const productTitle = inquiry.productTitle;
    stats.byProduct[productTitle] = (stats.byProduct[productTitle] || 0) + 1;
  }

  // Get recent inquiries (last 10)
  stats.recentInquiries = allInquiries.slice(0, 10);

  return stats;
}

/**
 * Get inquiries by product
 */
export async function getInquiriesByProduct(
  productId: string
): Promise<RentalInquiry[]> {
  return getAllInquiries({ productId });
}

/**
 * Get inquiries by customer
 */
export async function getInquiriesByCustomer(
  customerEmail: string
): Promise<RentalInquiry[]> {
  return getAllInquiries({ customerEmail });
}

/**
 * Check if an inquiry exists
 */
export async function inquiryExists(id: string): Promise<boolean> {
  const inquiry = await getInquiry(id);
  return inquiry !== null;
}

/**
 * Get inquiry count
 */
export async function getInquiryCount(): Promise<number> {
  const count = await redis.zcard(INQUIRY_REDIS_KEYS.allInquiries);
  return count || 0;
}
