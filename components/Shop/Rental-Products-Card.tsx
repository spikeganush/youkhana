'use client';

import { RentalProduct } from '@/types/rental-product';
import Link from 'next/link';
import Image from 'next/image';
import RentalSearchBar from './Rental-Search-Bar';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function RentalProductCard({ product }: { product: RentalProduct }) {
  const primaryImage = product.images[0];

  return (
    <Link href={`/product/${product.handle}`}>
      <div className='group relative'>
        {/* Product Image */}
        <div className='aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80'>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              width={400}
              height={400}
              className='h-full w-full object-cover object-center lg:h-full lg:w-full'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-gray-400'>
              No image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='mt-4 flex justify-between'>
          <div className='flex-1'>
            <h3 className='text-sm text-gray-700'>
              <span aria-hidden='true' className='absolute inset-0' />
              {product.title}
            </h3>
            {product.shortDescription && (
              <p className='mt-1 text-xs text-gray-500 line-clamp-2'>
                {product.shortDescription}
              </p>
            )}
            <div className='mt-2 flex flex-wrap gap-1'>
              <Badge variant='outline' className='text-xs'>
                {product.category}
              </Badge>
              {product.featured && (
                <Badge
                  variant='outline'
                  className='bg-yellow-50 text-yellow-700 border-yellow-200 text-xs'
                >
                  Featured
                </Badge>
              )}
            </div>
          </div>
          <div className='text-right ml-2'>
            <p className='text-sm font-medium text-gray-900'>
              ${product.rentalPrice.daily.toFixed(2)}
              <span className='text-xs font-normal text-gray-600'>/day</span>
            </p>
            {product.rentalPrice.weekly && (
              <p className='text-xs text-gray-600'>
                ${product.rentalPrice.weekly.toFixed(2)}/wk
              </p>
            )}
          </div>
        </div>

        {/* Availability Badge */}
        {product.availableQuantity === 0 && (
          <div className='absolute top-2 right-2'>
            <Badge variant='destructive' className='text-xs'>
              Unavailable
            </Badge>
          </div>
        )}
      </div>
    </Link>
  );
}

export type OrderByAndDirectionType = {
  orderBy: 'Date' | 'Price';
  direction: 'ASC' | 'DSC';
};

export default function RentalProductsCard({ products }: { products: RentalProduct[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [orderByAndDirection, setOrderByAndDirection] =
    useState<OrderByAndDirectionType>({
      orderBy: 'Date',
      direction: 'DSC',
    });

  const filteredProducts = useMemo(() => {
    let updatedProducts = products;

    // Filter by category
    if (selectedCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter products by selected tags
    if (selectedTags?.length > 0) {
      updatedProducts = updatedProducts.filter((product) =>
        product.tags.some((tag) => selectedTags.includes(tag.toLowerCase()))
      );
    }

    // Sort the filtered products
    return [...updatedProducts].sort((a, b) => {
      if (orderByAndDirection.orderBy === 'Date') {
        const aDate = new Date(a.updatedAt);
        const bDate = new Date(b.updatedAt);
        return orderByAndDirection.direction === 'ASC'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        const aPrice = a.rentalPrice.daily;
        const bPrice = b.rentalPrice.daily;
        return orderByAndDirection.direction === 'ASC'
          ? aPrice - bPrice
          : bPrice - aPrice;
      }
    });
  }, [selectedTags, selectedCategory, orderByAndDirection, products]);

  return (
    <>
      <RentalSearchBar
        products={products}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        orderByAndDirection={orderByAndDirection}
        setOrderByAndDirection={setOrderByAndDirection}
      />
      <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            return <RentalProductCard product={product} key={product.id} />;
          })
        ) : (
          <div className='col-span-full text-center py-12'>
            <p className='text-gray-500'>No products found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
