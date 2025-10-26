'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductVariant } from '@/types/shopify/type';
import { RentalInquiryDialog } from './Rental-inquiry-dialog';

export default function PurchaseButton({
  variants,
  available,
  productId,
  productTitle,
  productHandle,
}: {
  variants: ProductVariant[];
  available: boolean;
  productId: string;
  productTitle: string;
  productHandle: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const selectedColor = searchParams.get('color');
  const selectedSize = searchParams.get('size');

  // Find the correct variant based on selected options
  const selectedVariant = variants.find((variant) =>
    variant.selectedOptions.every((option) => {
      if (option.name === 'Color') return option.value === selectedColor;
      if (option.name === 'Size') return option.value === selectedSize;
      return true;
    })
  );

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className='w-full bg-gray-900 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 duration-150'
        disabled={!available}
      >
        {available ? 'Rent Now' : 'Unavailable'}
      </button>

      <RentalInquiryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={{
          id: productId,
          title: productTitle,
          handle: productHandle,
        }}
        selectedVariant={selectedVariant}
      />
    </>
  );
}
