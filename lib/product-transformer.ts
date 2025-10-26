/**
 * Product Transformer Utilities
 *
 * Converts RentalProduct to Shopify Product format for compatibility
 * with existing shop components during the migration from Shopify.
 */

import { RentalProduct, RentalProductImage as RentalImage } from '@/types/rental-product';
import { Product, Image, ProductVariant as ShopifyVariant } from '@/types/shopify/type';

/**
 * Transform RentalProductImage to Shopify Image format
 */
function transformImage(image: RentalImage): Image {
  return {
    url: image.url,
    altText: image.alt,
    width: 800,  // Default width - can be updated based on actual image
    height: 1200, // Default height - can be updated based on actual image
  };
}

/**
 * Create a default featured image when none exists
 */
function createDefaultFeaturedImage(title: string): Image {
  return {
    url: '/images/placeholder-product.png', // You can add a placeholder image
    altText: title,
    width: 800,
    height: 1200,
  };
}

/**
 * Transform RentalProduct to Shopify Product format
 * This allows existing shop components to work with rental products
 */
export function rentalProductToShopifyProduct(rental: RentalProduct): Product {
  // Create price range if it doesn't exist
  const priceRange = rental.priceRange || {
    minVariantPrice: {
      amount: rental.rentalPrice.daily.toString(),
      currencyCode: rental.currency,
    },
    maxVariantPrice: {
      amount: rental.rentalPrice.daily.toString(),
      currencyCode: rental.currency,
    },
  };

  // Use featuredImage if available, otherwise use first image, otherwise use placeholder
  const featuredImage = rental.featuredImage
    ? transformImage(rental.featuredImage)
    : rental.images.length > 0
    ? transformImage(rental.images[0])
    : createDefaultFeaturedImage(rental.title);

  // Transform variants or create a default variant if none exist
  const variants = rental.variants && rental.variants.length > 0
    ? rental.variants.map((variant) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        price: {
          amount: variant.rentalPrice.daily.toString(),
          currencyCode: rental.currency,
        },
      }))
    : [
        {
          id: `${rental.id}-default`,
          title: 'Default',
          availableForSale: rental.status === 'active' && rental.availableQuantity > 0,
          selectedOptions: [],
          price: {
            amount: rental.rentalPrice.daily.toString(),
            currencyCode: rental.currency,
          },
        },
      ];

  return {
    id: rental.id,
    handle: rental.handle,
    availableForSale: rental.status === 'active' && rental.availableQuantity > 0,
    title: rental.title,
    description: rental.description,
    descriptionHtml: `<p>${rental.description}</p>`, // Simple HTML conversion

    // Transform options (Size, Color, etc.)
    options: rental.options || [],

    // Transform price range
    priceRange,

    // Transform variants
    variants,

    // Transform images
    featuredImage,
    images: rental.images.length > 0 ? rental.images.map(transformImage) : [featuredImage],

    // SEO
    seo: {
      title: rental.title,
      description: rental.shortDescription || rental.description.substring(0, 160),
    },

    // Tags and metadata
    tags: rental.tags,
    updatedAt: rental.updatedAt,
  };
}

/**
 * Transform multiple RentalProducts to Shopify Products
 */
export function rentalProductsToShopifyProducts(rentals: RentalProduct[]): Product[] {
  return rentals.map(rentalProductToShopifyProduct);
}
