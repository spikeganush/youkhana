'use client';

import { RentalProduct } from '@/types/rental-product';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { NovelViewer } from './novel-viewer';

interface ProductPreviewDialogProps {
  product: RentalProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductPreviewDialog({
  product,
  open,
  onOpenChange,
}: ProductPreviewDialogProps) {
  if (!product) return null;

  const primaryImage = product.featuredImage || product.images[0];
  const hasImages = product.images.length > 0 || product.featuredImage;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{product.title}</DialogTitle>
              <DialogDescription>Product Preview</DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="ml-4"
            >
              <a
                href={`/product/${product.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </a>
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Image Section */}
          <div className="space-y-4">
            {hasImages ? (
              <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={primaryImage?.url || '/images/placeholder-product.png'}
                  alt={primaryImage?.alt || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No image</p>
              </div>
            )}

            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  product.status === 'active'
                    ? 'default'
                    : product.status === 'inactive'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </Badge>
              {product.featured && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Featured
                </Badge>
              )}
              <Badge variant="outline">{product.category}</Badge>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Rental Price</h3>
              <div className="mt-2 space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  ${product.rentalPrice.daily.toFixed(2)}/day
                </p>
                {product.rentalPrice.weekly && (
                  <p className="text-sm text-gray-600">
                    ${product.rentalPrice.weekly.toFixed(2)}/week
                  </p>
                )}
                {product.rentalPrice.monthly && (
                  <p className="text-sm text-gray-600">
                    ${product.rentalPrice.monthly.toFixed(2)}/month
                  </p>
                )}
              </div>
              {product.deposit && (
                <p className="mt-2 text-sm text-gray-600">
                  Security Deposit: ${product.deposit.toFixed(2)}
                </p>
              )}
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Availability</h3>
              <p className="mt-1 text-sm text-gray-900">
                {product.availableQuantity} of {product.totalQuantity} available
              </p>
            </div>

            {/* Options (Size, Color, etc.) */}
            {product.options && product.options.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Options</h3>
                <div className="mt-2 space-y-2">
                  {product.options.map((option) => (
                    <div key={option.id}>
                      <p className="text-sm font-medium">{option.name}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {option.values.map((value) => (
                          <Badge key={value} variant="outline">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              {product.shortDescription && (
                <p className="mt-1 text-sm text-gray-900 font-medium">
                  {product.shortDescription}
                </p>
              )}
              <div className="mt-2">
                <NovelViewer
                  content={product.description}
                  className="text-sm text-gray-600"
                />
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Specifications</h3>
                <dl className="mt-2 space-y-1">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="text-gray-600">{key}:</dt>
                      <dd className="text-gray-900 font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rental Terms */}
            {product.terms && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rental Terms</h3>
                <p className="mt-1 text-sm text-gray-600">{product.terms}</p>
              </div>
            )}

            {product.minRentalDays || product.maxRentalDays ? (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rental Period</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {product.minRentalDays && `Minimum: ${product.minRentalDays} days`}
                  {product.minRentalDays && product.maxRentalDays && ' • '}
                  {product.maxRentalDays && `Maximum: ${product.maxRentalDays} days`}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="mt-6 pt-4 border-t text-xs text-gray-500 space-y-1">
          <p>Handle: <code className="bg-gray-100 px-1 py-0.5 rounded">{product.handle}</code></p>
          <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
          <p>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
