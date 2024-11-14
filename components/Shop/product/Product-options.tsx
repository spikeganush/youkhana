'use client';

import React, { useEffect } from 'react';
import { Product } from '@/types/shopify/type';
import { useRouter, useSearchParams } from 'next/navigation';

const ProductOptions = ({ product }: { product: Product }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedColor = searchParams.get('color');
  const selectedSize = searchParams.get('size');

  useEffect(() => {
    if (!selectedColor || !selectedSize) {
      const url = `?color=${product.options[0].values[0]}&size=${product.options[1].values[0]}`;
      router.replace(url, { scroll: false });
    }
  }, [selectedColor, selectedSize, searchParams, product.options, router]);
  return (
    <>
      {
        /* Product options */
        product?.options
          .filter((option) => option.name === 'Color' || option.name === 'Size')
          .map((option) => (
            <div key={option.id} className='mt-4'>
              <h3 className='text-sm font-medium text-gray-900'>
                {option.name}
              </h3>
              <div className='mt-2'>
                <select
                  onChange={(e) => {
                    const value = e.target.value;
                    const key = option.name.toLowerCase();
                    const url = new URL(window.location.href);
                    url.searchParams.set(key, value);
                    router.replace(url.toString(), { scroll: false });
                  }}
                  defaultValue={
                    option.name === 'Color'
                      ? selectedColor || option.values[0]
                      : selectedSize || option.values[0]
                  }
                  name={option.name}
                  id={option.id}
                  className='block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                >
                  {option.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
      }
    </>
  );
};

export default ProductOptions;
