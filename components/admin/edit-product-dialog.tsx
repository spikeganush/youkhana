'use client';

import { useState, useEffect } from 'react';
import { RentalProduct } from '@/types/rental-product';
import { updateProductAction } from '@/app/admin/products/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ProductForm } from './product-form';

interface EditProductDialogProps {
  product: RentalProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: unknown) => {
    if (!product) return;

    setIsLoading(true);

    try {
      const result = await updateProductAction(product.id, formData);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information. All changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Update Product"
        />
      </DialogContent>
    </Dialog>
  );
}
