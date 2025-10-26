/**
 * Rental Inquiry Type Definitions
 *
 * Defines the schema for rental inquiries in the Youkhana rental system.
 * Inquiries are stored in Redis and sent via email to the owner.
 */

export type RentalInquiryStatus = 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'completed';

export interface RentalInquiry {
  // Identifiers
  id: string;                           // Unique UUID
  productId: string;                    // Product being inquired about
  productHandle: string;                // Product URL slug for reference
  productTitle: string;                 // Product name

  // Customer Information
  customerName: string;                 // Customer's full name
  customerEmail: string;                // Customer's email
  customerPhone?: string;               // Optional phone number

  // Rental Details
  startDate?: string;                   // Desired start date (ISO format)
  endDate?: string;                     // Desired end date (ISO format)
  rentalDays?: number;                  // Number of days (calculated or specified)

  // Selected Variant/Options
  selectedVariant?: {
    id: string;
    title: string;
    options: {
      name: string;                     // e.g., "Size", "Color"
      value: string;                    // e.g., "M", "Ivory"
    }[];
  };

  // Additional Information
  message?: string;                     // Customer's message or special requests

  // Pricing Snapshot (at time of inquiry)
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  deposit?: number;
  estimatedTotal?: number;              // Calculated total

  // Status & Tracking
  status: RentalInquiryStatus;
  notes?: string;                       // Admin notes

  // Metadata
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
  respondedAt?: string;                 // When admin responded
  respondedBy?: string;                 // Admin who responded
}

/**
 * Input type for creating a new rental inquiry
 */
export type CreateRentalInquiryInput = Omit<
  RentalInquiry,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'respondedAt' | 'respondedBy'
> & {
  status?: RentalInquiryStatus;         // Optional, defaults to 'pending'
};

/**
 * Input type for updating an existing rental inquiry
 */
export type UpdateRentalInquiryInput = Partial<
  Omit<RentalInquiry, 'id' | 'createdAt'>
>;

/**
 * Filter options for querying rental inquiries
 */
export interface RentalInquiryFilters {
  status?: RentalInquiryStatus;
  productId?: string;
  customerEmail?: string;
  startDate?: string;                   // From date
  endDate?: string;                     // To date
}

/**
 * Inquiry statistics for admin dashboard
 */
export interface InquiryStats {
  total: number;
  pending: number;
  contacted: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  byProduct: Record<string, number>;
  recentInquiries: RentalInquiry[];     // Last 5-10 inquiries
}

/**
 * Redis key patterns for inquiry storage
 */
export const INQUIRY_REDIS_KEYS = {
  inquiry: (id: string) => `inquiry:${id}`,
  allInquiries: 'inquiries:all',
  pendingInquiries: 'inquiries:pending',
  productInquiries: (productId: string) => `inquiries:product:${productId}`,
  customerInquiries: (email: string) => `inquiries:customer:${email}`,
  inquiryStats: 'stats:inquiries',
} as const;
