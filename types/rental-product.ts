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

export interface ProductOption {
  id: string;
  name: string;             // e.g., "Size", "Color"
  values: string[];         // e.g., ["XS", "S", "M", "L", "XL"] or ["Ivory", "Black", "Navy"]
}

export interface ProductVariant {
  id: string;
  title: string;            // e.g., "S / Ivory"
  availableForSale: boolean;
  selectedOptions: {
    name: string;           // e.g., "Size"
    value: string;          // e.g., "S"
  }[];
  rentalPrice: RentalPrice; // Variant-specific pricing (optional)
  availableQuantity: number; // Available units for this specific variant
}

export interface RentalPrice {
  daily: number;            // Price per day (required)
  weekly?: number;          // Price per week (optional)
  monthly?: number;         // Price per month (optional)
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
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

  // Variants & Options (for size/color selection)
  options?: ProductOption[];                // Available options (Size, Color) - optional for simple products
  variants?: ProductVariant[];              // All combinations of options - optional for simple products

  // Rental Pricing (base price, can be overridden per variant)
  rentalPrice: RentalPrice;
  priceRange?: PriceRange;                  // Min/max prices across all variants (for display) - auto-generated
  deposit?: number;                         // Security deposit amount
  currency: string;                         // Default: "AUD"

  // Inventory Management
  totalQuantity: number;                    // Total units owned across all variants
  availableQuantity: number;                // Currently available for rent across all variants

  // Media
  images: RentalProductImage[];
  featuredImage?: RentalProductImage;       // Primary image (first in images array) - optional for backward compatibility

  // Categorization & Search
  category: string;                         // e.g., "Dresses", "Tops", "Outerwear", "Accessories"
  tags: string[];                           // Searchable tags

  // Product Details
  specifications?: Record<string, string>;  // Key-value pairs
  // Example: { "Size": "S", "Material": "Silk Blend", "Color": "Ivory", "Fit": "Relaxed" }

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
 * Handle, priceRange, featuredImage, options, and variants are optional as they can be auto-generated
 */
export type CreateRentalProductInput = Omit<
  RentalProduct,
  'id' | 'createdAt' | 'updatedAt' | 'handle' | 'priceRange' | 'featuredImage' | 'options' | 'variants'
> & {
  handle?: string;
  priceRange?: PriceRange;           // Auto-calculated if not provided
  featuredImage?: RentalProductImage; // Defaults to first image if not provided
  options?: ProductOption[];          // Optional, can be empty for simple products
  variants?: ProductVariant[];        // Optional, can be empty for simple products
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
