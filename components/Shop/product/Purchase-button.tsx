'use client';

import { getMutationCheckout } from '@/lib/shopify';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { ProductVariant } from '@/types/shopify/type';

export default function PurchaseButton({
  variants,
  available,
}: {
  variants: ProductVariant[];
  available: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const selectedColor = searchParams.get('color');
  const selectedSize = searchParams.get('size');
  const [state, formAction] = useFormState(getMutationCheckout, {
    error: '',
    success: false,
  });

  // Find the correct variant based on selected options
  const selectedVariant = variants.find((variant) =>
    variant.selectedOptions.every((option) => {
      if (option.name === 'Color') return option.value === selectedColor;
      if (option.name === 'Size') return option.value === selectedSize;
      return true;
    })
  );

  if (state.webUrl) {
    // if not a safari browser, open the checkout in a new tab
    if (
      typeof window !== 'undefined' &&
      !navigator.userAgent.includes('Safari')
    ) {
      window.open(state.webUrl, '_blank');
    } else {
      // if safari, open the checkout in the same tab
      window.location.href = state.webUrl;
    }
  }

  return (
    <form action={formAction}>
      <input
        type='hidden'
        name='variantId'
        value={selectedVariant?.id || variants[0].id}
      />
      <button
        className='w-full bg-gray-900 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 duration-150'
        type='submit'
        disabled={loading || !available}
      >
        {loading && (
          <svg
            className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        )}
        {loading ? 'Processing' : available ? 'Purchase' : 'Sold Out'}
      </button>
    </form>
  );
}
