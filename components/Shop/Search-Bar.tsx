'use client';

import { Product } from '@/types/shopify/type';
import React, { useState, useEffect, useRef } from 'react';
import { OrderByAndDirectionType } from './Products-Card';
import { AnimatePresence, motion } from 'framer-motion';
import { debounce } from '@/lib/utils';

type SearchBarProps = {
  products: Product[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  orderByAndDirection: OrderByAndDirectionType;
  setOrderByAndDirection: (
    orderByAndDirection: OrderByAndDirectionType
  ) => void;
};

const SearchBar = ({
  products,
  selectedTags,
  setSelectedTags,
  orderByAndDirection,
  setOrderByAndDirection,
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [optionOpen, setOptionOpen] = useState(false);
  const optionRef = useRef<HTMLDivElement>(null);
  const iconOpenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue) {
      let listTags: Set<string> = new Set();

      products.forEach((product) => {
        product.tags.forEach((tag) => listTags.add(tag));
      });
      const allTags: string[] = Array.from(listTags);
      const filteredSuggestions = allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag)
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
    //eslint-disable-next-line
  }, [inputValue, selectedTags]);

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

  const resetTags = () => {
    setSelectedTags([]);
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
      <div className='relative'>
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
        <div className='flex w-full gap-10 justify-between'>
          <input
            className='block flex-1 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm'
            placeholder='Search'
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
          </div>
        </div>
        <AnimatePresence>
          {inputValue && suggestions?.length > 0 && (
            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className='absolute w-40 z-10 bg-white border border-gray-300 rounded-md mt-1'
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
      {selectedTags?.length > 0 && (
        <button onClick={resetTags} className='mt-3'>
          Reset Tags
        </button>
      )}
    </>
  );
};

export default SearchBar;
