'use client';

import React, { useEffect } from 'react';
import { Product } from '@/types/shopify/type';
import { useRouter, useSearchParams } from 'next/navigation';

type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

const ProductOptions = ({ product }: { product: Product }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filteredOptions = product.options.filter(
    (option) => option.name === 'Color' || option.name === 'Size'
  );

  const updateSearchParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set(key.toLowerCase(), value);
    router.replace(`?${newParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const colorOption = filteredOptions.find((opt) => opt.name === 'Color');
    const sizeOption = filteredOptions.find((opt) => opt.name === 'Size');

    if (!colorOption || !sizeOption) return;

    const currentColor = searchParams.get('color');
    const currentSize = searchParams.get('size');

    const isValidColor =
      currentColor && colorOption.values.includes(currentColor);
    const isValidSize = currentSize && sizeOption.values.includes(currentSize);

    if (!isValidColor || !isValidSize) {
      const newParams = new URLSearchParams();
      newParams.set(
        'color',
        isValidColor ? currentColor : colorOption.values[0]
      );
      newParams.set('size', isValidSize ? currentSize : sizeOption.values[0]);
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [searchParams, filteredOptions, router]);

  const renderSelect = (option: ProductOption) => {
    const paramKey = option.name.toLowerCase();
    const currentValue = searchParams.get(paramKey) || option.values[0];

    return (
      <div key={option.id} className='mt-4'>
        <h3 className='text-sm font-medium text-gray-900'>{option.name}</h3>
        <div className='mt-2'>
          <select
            onChange={(e) => updateSearchParam(option.name, e.target.value)}
            value={currentValue}
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
    );
  };

  return <>{filteredOptions.map(renderSelect)}</>;
};

export default ProductOptions;
