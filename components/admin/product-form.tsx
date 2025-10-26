'use client';

import { useState, useEffect } from 'react';
import { RentalProduct, ProductStatus } from '@/types/rental-product';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { NovelEditor } from './novel-editor';
import { ImageUploader } from './image-uploader';
import { JSONContent } from 'novel';
import type { RentalProductImage } from '@/types/rental-product';

interface ProductFormData {
  title: string;
  description: string;
  shortDescription: string;
  handle: string;
  category: string;
  tags: string[];
  images: RentalProductImage[];
  rentalPrice: {
    daily: number;
    weekly?: number;
    monthly?: number;
  };
  deposit?: number;
  totalQuantity: number;
  availableQuantity: number;
  status: ProductStatus;
  featured: boolean;
  terms?: string;
  minRentalDays?: number;
  maxRentalDays?: number;
  specifications?: Record<string, string>;
}

interface ProductFormProps {
  initialData?: Partial<RentalProduct>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

const COMMON_CATEGORIES = [
  'Dresses',
  'Tops & Blouses',
  'Bottoms',
  'Outerwear',
  'Jumpsuits & Rompers',
  'Sets & Co-ords',
  'Accessories',
  'Jersey Collection',
  'Couture',
  'Other',
];

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
}: ProductFormProps) {
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    handle: initialData?.handle || '',
    category: initialData?.category || '',
    tags: initialData?.tags || [],
    images: initialData?.images || [],
    rentalPrice: {
      daily: initialData?.rentalPrice?.daily || 0,
      weekly: initialData?.rentalPrice?.weekly,
      monthly: initialData?.rentalPrice?.monthly,
    },
    deposit: initialData?.deposit,
    totalQuantity: initialData?.totalQuantity || 1,
    availableQuantity: initialData?.availableQuantity || 1,
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    terms: initialData?.terms,
    minRentalDays: initialData?.minRentalDays,
    maxRentalDays: initialData?.maxRentalDays,
    specifications: initialData?.specifications || {},
  });

  const [tagInput, setTagInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Auto-generate handle from title if not manually set
  const [handleManuallyEdited, setHandleManuallyEdited] = useState(
    !!initialData?.handle
  );

  useEffect(() => {
    if (!handleManuallyEdited && formData.title) {
      const generatedHandle = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setFormData((prev) => ({ ...prev, handle: generatedHandle }));
    }
  }, [formData.title, handleManuallyEdited]);

  const handleInputChange = (
    field: keyof ProductFormData,
    value: string | number | boolean | RentalProductImage[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (
    field: 'daily' | 'weekly' | 'monthly',
    value: string
  ) => {
    const numValue = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      rentalPrice: {
        ...prev.rentalPrice,
        [field]: isNaN(numValue) ? undefined : numValue,
      },
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey.trim()]: specValue.trim(),
        },
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Silk Braided Midi Dress"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="handle">
            URL Handle * {!handleManuallyEdited && '(auto-generated)'}
          </Label>
          <Input
            id="handle"
            value={formData.handle}
            onChange={(e) => {
              handleInputChange('handle', e.target.value);
              setHandleManuallyEdited(true);
            }}
            placeholder="silk-braided-midi-dress"
            required
          />
          <p className="text-xs text-muted-foreground">
            Used in the product URL. Only lowercase letters, numbers, and hyphens.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <NovelEditor
            value={formData.description}
            onChange={(json) => {
              // Store as stringified JSON
              handleInputChange('description', JSON.stringify(json));
            }}
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) =>
              handleInputChange('shortDescription', e.target.value)
            }
            placeholder="Brief description for cards (max 150 chars)"
            maxLength={150}
          />
          <p className="text-xs text-muted-foreground">
            {formData.shortDescription.length}/150 characters
          </p>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Product Images</h3>
        <ImageUploader
          images={formData.images}
          onChange={(images) => handleInputChange('images', images)}
          maxImages={10}
        />
        <p className="text-xs text-muted-foreground">
          First image will be used as the primary product image
        </p>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Pricing</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyPrice">Daily Rate * (AUD)</Label>
            <Input
              id="dailyPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.rentalPrice.daily || ''}
              onChange={(e) => handlePriceChange('daily', e.target.value)}
              placeholder="50.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeklyPrice">Weekly Rate (AUD)</Label>
            <Input
              id="weeklyPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.rentalPrice.weekly || ''}
              onChange={(e) => handlePriceChange('weekly', e.target.value)}
              placeholder="300.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyPrice">Monthly Rate (AUD)</Label>
            <Input
              id="monthlyPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.rentalPrice.monthly || ''}
              onChange={(e) => handlePriceChange('monthly', e.target.value)}
              placeholder="1000.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">Security Deposit (AUD)</Label>
          <Input
            id="deposit"
            type="number"
            step="0.01"
            min="0"
            value={formData.deposit || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              handleInputChange('deposit', isNaN(value) ? undefined : value);
            }}
            placeholder="500.00"
          />
        </div>
      </div>

      {/* Inventory */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Inventory</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalQuantity">Total Quantity *</Label>
            <Input
              id="totalQuantity"
              type="number"
              min="0"
              value={formData.totalQuantity}
              onChange={(e) =>
                handleInputChange('totalQuantity', parseInt(e.target.value) || 0)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availableQuantity">Available Quantity *</Label>
            <Input
              id="availableQuantity"
              type="number"
              min="0"
              max={formData.totalQuantity}
              value={formData.availableQuantity}
              onChange={(e) =>
                handleInputChange(
                  'availableQuantity',
                  parseInt(e.target.value) || 0
                )
              }
              required
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Tags</h3>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag (press Enter)"
          />
          <Button type="button" onClick={addTag} variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <div
              key={tag}
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Specifications</h3>
        <div className="flex gap-2">
          <Input
            value={specKey}
            onChange={(e) => setSpecKey(e.target.value)}
            placeholder="Key (e.g., Material)"
            className="flex-1"
          />
          <Input
            value={specValue}
            onChange={(e) => setSpecValue(e.target.value)}
            placeholder="Value (e.g., Silk Blend)"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addSpecification}
            variant="outline"
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {Object.entries(formData.specifications || {}).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-secondary p-2 rounded"
            >
              <div className="flex-1">
                <span className="font-medium">{key}:</span> {value}
              </div>
              <button
                type="button"
                onClick={() => removeSpecification(key)}
                className="text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rental Terms */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Rental Terms</h3>

        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            value={formData.terms || ''}
            onChange={(e) => handleInputChange('terms', e.target.value)}
            placeholder="Special rental terms for this product"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minRentalDays">Minimum Rental Days</Label>
            <Input
              id="minRentalDays"
              type="number"
              min="1"
              value={formData.minRentalDays || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleInputChange('minRentalDays', isNaN(value) ? undefined : value);
              }}
              placeholder="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxRentalDays">Maximum Rental Days</Label>
            <Input
              id="maxRentalDays"
              type="number"
              min="1"
              value={formData.maxRentalDays || ''}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleInputChange('maxRentalDays', isNaN(value) ? undefined : value);
              }}
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* Status & Visibility */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Status & Visibility</h3>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: ProductStatus) =>
              handleInputChange('status', value)
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked: boolean) =>
              handleInputChange('featured', checked === true)
            }
          />
          <Label htmlFor="featured" className="cursor-pointer">
            Mark as featured product
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
