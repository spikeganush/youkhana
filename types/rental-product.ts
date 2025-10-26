/**
 * Rental Product Type Definitions
 *
 * Defines the schema for rental products in the Youkhana rental system.
 * Products are stored in Redis and displayed in the public rental catalog.
 */

export interface RentalProductImage {
  url: string;              // Vercel Blob URL
  pathname: string;         // Blob pathname for deletion
  alt: string;              // Alt text for accessibility
  order: number;            // Display order (0 = primary)
}

export interface RentalPrice {
  daily: number;            // Price per day (required)
  weekly?: number;          // Price per week (optional)
  monthly?: number;         // Price per month (optional)
}

export type ProductStatus = 'active' | 'inactive' | 'draft';

export interface RentalProduct {
  // Identifiers
  id: string;                               // Unique UUID
  handle: string;                           // URL slug (e.g., "sony-a7iii-camera")

  // Basic Info
  title: string;                            // Product name
  description: string;                      // Full description (supports markdown)
  shortDescription?: string;                // Brief description for cards (max 150 chars)

  // Rental Pricing
  rentalPrice: RentalPrice;
  deposit?: number;                         // Security deposit amount
  currency: string;                         // Default: "USD"

  // Inventory Management
  totalQuantity: number;                    // Total units owned
  availableQuantity: number;                // Currently available for rent

  // Media
  images: RentalProductImage[];

  // Categorization & Search
  category: string;                         // e.g., "Camera", "Lens", "Lighting", "Audio"
  tags: string[];                           // Searchable tags

  // Product Details
  specifications?: Record<string, string>;  // Key-value pairs
  // Example: { "Sensor": "Full Frame", "Megapixels": "24.2 MP", "Weight": "650g" }

  // Rental Terms
  terms?: string;                           // Rental terms specific to this product
  minRentalDays?: number;                   // Minimum rental period
  maxRentalDays?: number;                   // Maximum rental period

  // Status & Visibility
  status: ProductStatus;
  featured: boolean;                        // Show on homepage/featured section

  // Metadata
  createdAt: string;                        // ISO timestamp
  updatedAt: string;                        // ISO timestamp
  createdBy: string;                        // Admin email who created
  lastModifiedBy?: string;                  // Admin email who last edited
}

/**
 * Input type for creating a new rental product
 * Omits auto-generated fields like id, createdAt, updatedAt
 * Handle is optional as it can be auto-generated from title
 */
export type CreateRentalProductInput = Omit<
  RentalProduct,
  'id' | 'createdAt' | 'updatedAt' | 'handle'
> & {
  handle?: string;
};

/**
 * Input type for updating an existing rental product
 * All fields except id are optional
 */
export type UpdateRentalProductInput = Partial<
  Omit<RentalProduct, 'id' | 'createdAt' | 'createdBy'>
>;

/**
 * Filter options for querying rental products
 */
export interface RentalProductFilters {
  category?: string;
  status?: ProductStatus;
  featured?: boolean;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;        // Only show products with availableQuantity > 0
}

/**
 * Product statistics for admin dashboard
 */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  drafts: number;
  featured: number;
  byCategory: Record<string, number>;
  totalValue: number;         // Sum of all deposits (for insurance tracking)
  averageRentalPrice: number; // Average daily rental price
}

/**
 * Redis key patterns for product storage
 */
export const REDIS_KEYS = {
  product: (id: string) => `product:${id}`,
  productHandle: (handle: string) => `product:handle:${handle}`,
  allProducts: 'products:all',
  activeProducts: 'products:active',
  featuredProducts: 'products:featured',
  categoryProducts: (category: string) => `products:category:${category}`,
  tagProducts: (tag: string) => `products:search:${tag}`,
  allCategories: 'categories:all',
  allTags: 'tags:all',
  productStats: 'stats:products',
} as const;
