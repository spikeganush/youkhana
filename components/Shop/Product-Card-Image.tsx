'use client';

import { useState } from 'react';
import { shimmer } from '../ui/skeletons';
import Image from 'next/image';
import { Product } from '@/types/shopify/type';

export default function ProductCardImage({ product }: { product: Product }) {
  const image = product.images[0].url;
  const [imageLoading, setImageLoading] = useState(true);
  const available = product.availableForSale;
  return (
    <div className="relative aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none lg:h-80 group-hover:opacity-75 duration-300">
      {imageLoading && (
        <div className={`${shimmer} absolute inset-0 bg-gray-200 rounded-md`} />
      )}
      {!available && (
        <div className="absolute inset-0 z-10 bg-gray-200/50 rounded-md flex items-center justify-center">
          <p className="text-gray-700 text-2xl font-semibold ">Sold Out</p>
        </div>
      )}

      <Image
        src={image}
        alt={product.title}
        height={640}
        width={640}
        className="h-full w-full object-cover object-center lg:h-full lg:w-full group-hover:scale-110 duration-300"
        onLoad={() => setImageLoading(false)}
      />
    </div>
  );
}
