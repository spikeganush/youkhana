'use client';

import { RentalProduct } from '@/types/rental-product';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OrderByAndDirectionType } from './Rental-Products-Card';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from '@/lib/utils';

type RentalSearchBarProps = {
  products: RentalProduct[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  orderByAndDirection: OrderByAndDirectionType;
  setOrderByAndDirection: (
    orderByAndDirection: OrderByAndDirectionType
  ) => void;
};

const RentalSearchBar = ({
  products,
  selectedTags,
  setSelectedTags,
  selectedCategory,
  setSelectedCategory,
  orderByAndDirection,
  setOrderByAndDirection,
}: RentalSearchBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [optionOpen, setOptionOpen] = useState(false);
  const optionRef = useRef<HTMLDivElement>(null);
  const iconOpenRef = useRef<HTMLDivElement>(null);

  // Get unique categories from products
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [products]);

  const suggestions = useMemo(() => {
    if (inputValue) {
      let listTags: Set<string> = new Set();

      products.forEach((product) => {
        product.tags.forEach((tag) => listTags.add(tag));
      });
      const allTags: string[] = Array.from(listTags);
      return allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
    }
    return [];
  }, [inputValue, selectedTags, products]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    if (value.endsWith(' ')) {
      const newTag = value.trim();
      addTag(newTag);
      setInputValue('');
    }
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag.toLowerCase()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(
      selectedTags.filter(
        (tag) => tag.toLowerCase() !== tagToRemove.toLowerCase()
      )
    );
  };

  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('');
    setInputValue('');
  };

  const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderByAndDirection({
      ...orderByAndDirection,
      orderBy: event.target.value as 'Date' | 'Price',
    });
  };

  const toggleSortDirection = () => {
    setOrderByAndDirection({
      ...orderByAndDirection,
      direction: orderByAndDirection.direction === 'ASC' ? 'DSC' : 'ASC',
    });
  };

  const toggleOptionOpen = debounce(() => {
    setOptionOpen((prev) => !prev);
  }, 100);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionOpen &&
        optionRef.current &&
        (!optionRef.current.contains(event.target as Node) ||
          !iconOpenRef.current?.contains(event.target as Node))
      ) {
        toggleOptionOpen();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    //eslint-disable-next-line
  }, [optionRef, optionOpen, iconOpenRef]);

  return (
    <>
      <div className='flex flex-col md:flex-row gap-4 mb-4'>
        {/* Search input */}
        <div className='relative flex-1'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            {/* Heroicon name: search */}
            <svg
              className='w-5 h-5 text-gray-400'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M8.25 14.5a6.25 6.25 0 100-12.5 6.25 6.25 0 000 12.5zM16.25 10a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0z'
              />
            </svg>
          </div>
          <input
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm'
            placeholder='Search by tags...'
            value={inputValue}
            onChange={handleInputChange}
            type='text'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTag(inputValue);
                setInputValue('');
              }
            }}
          />
          <AnimatePresence>
            {inputValue && suggestions?.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className='absolute w-full z-10 bg-white border border-gray-300 rounded-md mt-1'
              >
                {suggestions &&
                  suggestions.map((tag, index) => (
                    <li
                      key={index}
                      className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                      onClick={() => {
                        addTag(tag);
                        setInputValue('');
                      }}
                    >
                      {tag}
                    </li>
                  ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Category filter */}
        <select
          className='px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm'
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value=''>All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Sort options */}
        <div className='relative my-auto' ref={iconOpenRef}>
          <button className='w-12' onClick={toggleOptionOpen}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-6 h-6 mx-auto'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75'
              />
            </svg>
          </button>
          <AnimatePresence>
            {optionOpen && (
              <motion.div
                ref={optionRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 5 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className='absolute -left-28 w-40 z-10 bg-white border border-gray-300 rounded-md mt-1'
              >
                <div className='flex flex-col gap-1'>
                  <div className='flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    <span>Sort By</span>
                    <select
                      className='bg-transparent'
                      onChange={handleOrderChange}
                      value={orderByAndDirection.orderBy}
                    >
                      <option value='Date'>Date</option>
                      <option value='Price'>Price</option>
                    </select>
                  </div>
                  <div className='flex justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer'>
                    <span>Order by</span>
                    <button onClick={toggleSortDirection}>
                      {orderByAndDirection.direction}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected tags */}
      <div className='flex flex-wrap gap-2 mt-3'>
        {selectedTags &&
          selectedTags.map((tag, index) => (
            <span
              key={index}
              className='chip px-4 py-2 bg-slate-300 rounded-xl hover:bg-slate-200 cursor-pointer'
              onClick={() => removeTag(tag)}
            >
              {tag}{' '}
              <button>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  className='w-4 h-4'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </span>
          ))}
      </div>
      {(selectedTags?.length > 0 || selectedCategory) && (
        <button
          onClick={resetFilters}
          className='mt-3 text-sm text-slate-600 hover:text-slate-900'
        >
          Reset Filters
        </button>
      )}
    </>
  );
};

export default RentalSearchBar;
