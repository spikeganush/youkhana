'use client';

import { shimmer } from '@/components/ui/skeletons';
import { Image as ImageType, Product } from '@/types/shopify/type';
import Image from 'next/image';
import { useState } from 'react';

export default function ProductDetailImages({ product }: { product: Product }) {
  const [imageSelected, setImageSelected] = useState<string>(
    product?.images[0].url
  );
  const imagesNoneSelected = product?.images
    .filter((image: ImageType) => image.url !== imageSelected)
    .map((image: ImageType) => image.url);

  const [mainImageLoading, setMainImageLoading] = useState(true);
  // A useState of the imagesNoneSelected loading state with the url as the key
  const [imagesNoneSelectedLoading, setImagesNoneSelectedLoading] = useState<
    Record<string, boolean>
  >(
    imagesNoneSelected.reduce((acc, image) => {
      acc[image] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  return (
    <div className="max-w-2xl">
      <div className="mx-auto mt-6 max-w-2xl sm:px-6">
        <div className="relative block overflow-hidden rounded-lg w-full aspect-square md:w-[624px] md:y-[624px]">
          {mainImageLoading && (
            <div
              className={`${shimmer} absolute inset-0 bg-gray-200 rounded-md mx-auto`}
            />
          )}
          <Image
            src={imageSelected}
            alt={product?.title!}
            height={640}
            width={640}
            className="h-full w-full object-cover object-center"
            onLoad={() => setMainImageLoading(false)}
            unoptimized
          />
        </div>
      </div>
      {/* Image selector */}

      {imagesNoneSelected && (
        <div className="mt-6 mx-auto max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="flex space-x-4">
            {imagesNoneSelected.map((image: string) => (
              <button
                key={image}
                onClick={() => {
                  setImageSelected(image);
                }}
                className="relative flex-shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {imagesNoneSelectedLoading[image] && (
                  <div
                    className={`${shimmer} absolute inset-0 bg-gray-200 rounded-md`}
                  />
                )}
                <Image
                  src={image}
                  alt={product?.title!}
                  height={640}
                  width={640}
                  className="h-20 w-20 rounded-md object-cover object-center"
                  onLoad={() => {
                    setImagesNoneSelectedLoading((prevState) => ({
                      ...prevState,
                      [image]: false,
                    }));
                  }}
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
