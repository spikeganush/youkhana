/**
 * @deprecated This component uses Shopify products which are no longer active.
 * Kept for reference only. See Rental-Products-Card.tsx for rental product implementation.
 */

'use client';

import { Product } from '@/types/shopify/type';
import Link from 'next/link';
import ProductCardImage from './Product-Card-Image';
import SearchBar from './Search-Bar';
import { useMemo, useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange.minVariantPrice;

  return (
    <Link href={`/product/${product.handle}`}>
      <div className='group relative'>
        <ProductCardImage product={product} />
        <div className='mt-4 flex justify-between'>
          <div>
            <h3 className='text-sm text-gray-700'>
              <span aria-hidden='true' className='absolute inset-0' />
              {product.title}
            </h3>
            {/* <p className="mt-1 text-sm text-gray-500">Black</p> */}
          </div>
          <p className='text-sm font-medium text-gray-900'>{`${
            price.currencyCode
          }${Number(price.amount).toFixed()}`}</p>
        </div>
      </div>
    </Link>
  );
}

export type OrderByAndDirectionType = {
  orderBy: 'Date' | 'Price';
  direction: 'ASC' | 'DSC';
};

export default function ProductsCard({ products }: { products: Product[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [orderByAndDirection, setOrderByAndDirection] =
    useState<OrderByAndDirectionType>({
      orderBy: 'Date',
      direction: 'DSC',
    });

  const filteredProducts = useMemo(() => {
    let updatedProducts = products;

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
        const aPrice = Number(a.priceRange.minVariantPrice.amount);
        const bPrice = Number(b.priceRange.minVariantPrice.amount);
        return orderByAndDirection.direction === 'ASC'
          ? aPrice - bPrice
          : bPrice - aPrice;
      }
    });
  }, [selectedTags, orderByAndDirection, products]);

  return (
    <>
      <SearchBar
        products={products}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        orderByAndDirection={orderByAndDirection}
        setOrderByAndDirection={setOrderByAndDirection}
      />
      <div className='mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8'>
        {filteredProducts &&
          filteredProducts.map((product) => {
            return <ProductCard product={product} key={product.id} />;
          })}
      </div>
    </>
  );
}
