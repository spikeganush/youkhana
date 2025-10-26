/**
 * Rental Products Redis Operations
 *
 * This module handles all rental product CRUD operations with Redis.
 * Products are the core entity in the rental management system.
 */

import { redis } from "./redist";
import {
  RentalProduct,
  CreateRentalProductInput,
  UpdateRentalProductInput,
  RentalProductFilters,
  ProductStats,
  REDIS_KEYS,
} from "@/types/rental-product";
import { randomUUID } from "crypto";

/**
 * Generate a URL-friendly handle from a product title
 */
function generateHandle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove duplicate hyphens
}

/**
 * Ensure a handle is unique by appending a number if needed
 */
async function ensureUniqueHandle(baseHandle: string): Promise<string> {
  let handle = baseHandle;
  let counter = 1;

  while (true) {
    const existing = await redis.get(REDIS_KEYS.productHandle(handle));
    if (!existing) {
      return handle;
    }
    handle = `${baseHandle}-${counter}`;
    counter++;
  }
}

/**
 * Create a new rental product
 */
export async function createProduct(
  input: CreateRentalProductInput
): Promise<RentalProduct> {
  // Validate required fields
  if (!input.title || !input.description) {
    throw new Error("Title and description are required");
  }

  if (!input.rentalPrice?.daily || input.rentalPrice.daily <= 0) {
    throw new Error("Daily rental price is required and must be positive");
  }

  if (input.totalQuantity < 0 || input.availableQuantity < 0) {
    throw new Error("Quantities cannot be negative");
  }

  if (input.availableQuantity > input.totalQuantity) {
    throw new Error("Available quantity cannot exceed total quantity");
  }

  // Generate unique ID and handle
  const id = randomUUID();
  const baseHandle = input.handle || generateHandle(input.title);
  const handle = await ensureUniqueHandle(baseHandle);

  const now = new Date().toISOString();

  const currency = input.currency || "AUD";

  // Auto-generate priceRange if not provided
  const priceRange = input.priceRange || {
    minVariantPrice: {
      amount: input.rentalPrice.daily.toString(),
      currencyCode: currency,
    },
    maxVariantPrice: {
      amount: input.rentalPrice.daily.toString(),
      currencyCode: currency,
    },
  };

  // Auto-set featuredImage to first image if provided
  const featuredImage = input.featuredImage || (input.images && input.images.length > 0
    ? input.images[0]
    : undefined);

  const product: RentalProduct = {
    ...input,
    id,
    handle,
    currency,
    images: input.images || [],
    featuredImage,
    priceRange,
    options: input.options || [],
    variants: input.variants || [],
    tags: input.tags || [],
    category: input.category || "Uncategorized",
    status: input.status || "draft",
    featured: input.featured || false,
    createdAt: now,
    updatedAt: now,
  };

  // Store product in Redis as JSON string
  await redis.set(REDIS_KEYS.product(id), JSON.stringify(product));

  // Store handle-to-ID mapping
  await redis.set(REDIS_KEYS.productHandle(handle), id);

  // Add to sorted set (score = timestamp for chronological ordering)
  await redis.zadd(REDIS_KEYS.allProducts, {
    score: Date.now(),
    member: id,
  });

  // Add to status-specific sets
  if (product.status === "active") {
    await redis.sadd(REDIS_KEYS.activeProducts, id);
  }

  if (product.featured) {
    await redis.sadd(REDIS_KEYS.featuredProducts, id);
  }

  // Add to category set
  await redis.sadd(REDIS_KEYS.categoryProducts(product.category), id);
  await redis.sadd(REDIS_KEYS.allCategories, product.category);

  // Add to tag sets
  for (const tag of product.tags) {
    await redis.sadd(REDIS_KEYS.tagProducts(tag), id);
    await redis.sadd(REDIS_KEYS.allTags, tag);
  }

  return product;
}

/**
 * Get a product by ID
 */
export async function getProduct(id: string): Promise<RentalProduct | null> {
  if (!id) {
    return null;
  }

  const productData = await redis.get(REDIS_KEYS.product(id));

  if (!productData) {
    return null;
  }

  // Handle both cases: Redis returning a string OR an already-parsed object
  let product: RentalProduct;
  if (typeof productData === 'string') {
    product = JSON.parse(productData);
  } else {
    // Redis client already deserialized the JSON
    product = productData as RentalProduct;
  }

  return product;
}

/**
 * Get a product by handle (URL slug)
 */
export async function getProductByHandle(
  handle: string
): Promise<RentalProduct | null> {
  if (!handle) {
    return null;
  }

  const id = await redis.get(REDIS_KEYS.productHandle(handle));
  if (!id || typeof id !== 'string') {
    return null;
  }

  return getProduct(id);
}

/**
 * Get all products with optional filters
 */
export async function getAllProducts(
  filters?: RentalProductFilters
): Promise<RentalProduct[]> {
  let productIds: string[] = [];

  // Determine which set to query based on filters
  if (filters?.category) {
    const ids = await redis.smembers(
      REDIS_KEYS.categoryProducts(filters.category)
    );
    if (Array.isArray(ids)) {
      productIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else if (filters?.status === "active") {
    const ids = await redis.smembers(REDIS_KEYS.activeProducts);
    if (Array.isArray(ids)) {
      productIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else if (filters?.featured) {
    const ids = await redis.smembers(REDIS_KEYS.featuredProducts);
    if (Array.isArray(ids)) {
      productIds = ids.filter((id): id is string => typeof id === 'string');
    }
  } else {
    // Get all products from sorted set (newest first)
    const ids = await redis.zrange(REDIS_KEYS.allProducts, 0, -1, {
      rev: true,
    });

    if (Array.isArray(ids)) {
      productIds = ids.filter((id): id is string => typeof id === 'string');
    }
  }

  if (productIds.length === 0) {
    return [];
  }

  // Fetch all products in parallel
  const products = await Promise.all(
    productIds.map(async (id) => {
      const product = await getProduct(id);
      return product;
    })
  );

  // Filter out null values
  let filteredProducts = products.filter(
    (product): product is RentalProduct => product !== null
  );

  // Apply additional filters
  if (filters) {
    if (filters.status && filters.status !== "active") {
      filteredProducts = filteredProducts.filter(
        (p) => p.status === filters.status
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = filteredProducts.filter((p) =>
        filters.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.rentalPrice.daily >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        (p) => p.rentalPrice.daily <= filters.maxPrice!
      );
    }

    if (filters.available) {
      filteredProducts = filteredProducts.filter(
        (p) => p.availableQuantity > 0
      );
    }
  }

  return filteredProducts;
}

/**
 * Update a product
 */
export async function updateProduct(
  id: string,
  updates: UpdateRentalProductInput
): Promise<RentalProduct> {
  if (!id) {
    throw new Error("Product ID is required");
  }

  // Get existing product
  const existingProduct = await getProduct(id);
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  // Validate quantities if being updated
  if (
    updates.totalQuantity !== undefined ||
    updates.availableQuantity !== undefined
  ) {
    const newTotal = updates.totalQuantity ?? existingProduct.totalQuantity;
    const newAvailable =
      updates.availableQuantity ?? existingProduct.availableQuantity;

    if (newTotal < 0 || newAvailable < 0) {
      throw new Error("Quantities cannot be negative");
    }

    if (newAvailable > newTotal) {
      throw new Error("Available quantity cannot exceed total quantity");
    }
  }

  // Handle handle updates
  if (updates.handle && updates.handle !== existingProduct.handle) {
    const uniqueHandle = await ensureUniqueHandle(updates.handle);
    updates.handle = uniqueHandle;

    // Update handle mapping
    await redis.del(REDIS_KEYS.productHandle(existingProduct.handle));
    await redis.set(REDIS_KEYS.productHandle(uniqueHandle), id);
  }

  const updatedProduct: RentalProduct = {
    ...existingProduct,
    ...updates,
    id, // Ensure ID doesn't change
    createdAt: existingProduct.createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(),
  };

  // Update product in Redis as JSON string
  await redis.set(REDIS_KEYS.product(id), JSON.stringify(updatedProduct));

  // Update status-specific sets if status changed
  if (updates.status && updates.status !== existingProduct.status) {
    if (existingProduct.status === "active") {
      await redis.srem(REDIS_KEYS.activeProducts, id);
    }
    if (updates.status === "active") {
      await redis.sadd(REDIS_KEYS.activeProducts, id);
    }
  }

  // Update featured set if featured changed
  if (
    updates.featured !== undefined &&
    updates.featured !== existingProduct.featured
  ) {
    if (updates.featured) {
      await redis.sadd(REDIS_KEYS.featuredProducts, id);
    } else {
      await redis.srem(REDIS_KEYS.featuredProducts, id);
    }
  }

  // Update category sets if category changed
  if (updates.category && updates.category !== existingProduct.category) {
    await redis.srem(REDIS_KEYS.categoryProducts(existingProduct.category), id);
    await redis.sadd(REDIS_KEYS.categoryProducts(updates.category), id);
    await redis.sadd(REDIS_KEYS.allCategories, updates.category);
  }

  // Update tag sets if tags changed
  if (updates.tags) {
    // Remove from old tag sets
    for (const tag of existingProduct.tags) {
      await redis.srem(REDIS_KEYS.tagProducts(tag), id);
    }
    // Add to new tag sets
    for (const tag of updates.tags) {
      await redis.sadd(REDIS_KEYS.tagProducts(tag), id);
      await redis.sadd(REDIS_KEYS.allTags, tag);
    }
  }

  return updatedProduct;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  if (!id) {
    throw new Error("Product ID is required");
  }

  const product = await getProduct(id);
  if (!product) {
    throw new Error("Product not found");
  }

  // Delete product from Redis
  await redis.del(REDIS_KEYS.product(id));

  // Delete handle mapping
  await redis.del(REDIS_KEYS.productHandle(product.handle));

  // Remove from sorted set
  await redis.zrem(REDIS_KEYS.allProducts, id);

  // Remove from status-specific sets
  await redis.srem(REDIS_KEYS.activeProducts, id);
  await redis.srem(REDIS_KEYS.featuredProducts, id);

  // Remove from category set
  await redis.srem(REDIS_KEYS.categoryProducts(product.category), id);

  // Remove from tag sets
  for (const tag of product.tags) {
    await redis.srem(REDIS_KEYS.tagProducts(tag), id);
  }
}

/**
 * Toggle product status (active/inactive/draft)
 */
export async function toggleProductStatus(
  id: string,
  status: "active" | "inactive" | "draft"
): Promise<RentalProduct> {
  return updateProduct(id, { status });
}

/**
 * Toggle product featured status
 */
export async function toggleFeatured(id: string): Promise<RentalProduct> {
  const product = await getProduct(id);
  if (!product) {
    throw new Error("Product not found");
  }

  return updateProduct(id, { featured: !product.featured });
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  category: string
): Promise<RentalProduct[]> {
  return getAllProducts({ category });
}

/**
 * Search products by query (searches title, description, tags, category)
 */
export async function searchProducts(query: string): Promise<RentalProduct[]> {
  if (!query || query.trim().length === 0) {
    return getAllProducts();
  }

  const allProducts = await getAllProducts();
  const searchTerm = query.toLowerCase();

  return allProducts.filter((product) => {
    return (
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      (product.shortDescription &&
        product.shortDescription.toLowerCase().includes(searchTerm))
    );
  });
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<string[]> {
  const categories = await redis.smembers(REDIS_KEYS.allCategories);
  if (Array.isArray(categories)) {
    return categories.filter((cat): cat is string => typeof cat === 'string');
  }
  return [];
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<string[]> {
  const tags = await redis.smembers(REDIS_KEYS.allTags);
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === 'string');
  }
  return [];
}

/**
 * Get product statistics for admin dashboard
 */
export async function getProductStats(): Promise<ProductStats> {
  const allProducts = await getAllProducts();

  const stats: ProductStats = {
    total: allProducts.length,
    active: allProducts.filter((p) => p.status === "active").length,
    inactive: allProducts.filter((p) => p.status === "inactive").length,
    drafts: allProducts.filter((p) => p.status === "draft").length,
    featured: allProducts.filter((p) => p.featured).length,
    byCategory: {},
    totalValue: 0,
    averageRentalPrice: 0,
  };

  // Calculate category breakdown
  for (const product of allProducts) {
    stats.byCategory[product.category] =
      (stats.byCategory[product.category] || 0) + 1;
  }

  // Calculate total value (sum of deposits)
  stats.totalValue = allProducts.reduce((sum, p) => {
    return sum + (p.deposit || 0) * p.totalQuantity;
  }, 0);

  // Calculate average rental price
  if (allProducts.length > 0) {
    const totalDailyPrice = allProducts.reduce((sum, p) => {
      return sum + p.rentalPrice.daily;
    }, 0);
    stats.averageRentalPrice = totalDailyPrice / allProducts.length;
  }

  return stats;
}

/**
 * Check if a product exists
 */
export async function productExists(id: string): Promise<boolean> {
  const product = await getProduct(id);
  return product !== null;
}

/**
 * Get product count
 */
export async function getProductCount(): Promise<number> {
  const count = await redis.zcard(REDIS_KEYS.allProducts);
  return count || 0;
}
