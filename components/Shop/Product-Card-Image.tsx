'use client';

import { useState } from 'react';
import { shimmer } from '../ui/skeletons';
import Image from 'next/image';
import { Product } from '@/types/shopify/type';

export default function ProductCardImage({ product }: { product: Product }) {
  const image = product.images[0].url;
  const [imageLoading, setImageLoading] = useState(true);
  return (
    <div className="relative aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 duration-300">
      {imageLoading && (
        <div className={`${shimmer} absolute inset-0 bg-gray-200 rounded-md`} />
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
