'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, GripVertical, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { RentalProductImage } from '@/types/rental-product';

interface ImagePreviewProps {
  image: RentalProductImage;
  index: number;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onUpdateAlt: (index: number, alt: string) => void;
  totalImages: number;
}

export function ImagePreview({
  image,
  index,
  onRemove,
  onReorder,
  onUpdateAlt,
  totalImages,
}: ImagePreviewProps) {
  const [altText, setAltText] = useState(image.alt);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isPrimary = index === 0;

  const handleSaveAlt = () => {
    onUpdateAlt(index, altText);
    setIsEditDialogOpen(false);
  };

  const handleMoveLeft = () => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveRight = () => {
    if (index < totalImages - 1) {
      onReorder(index, index + 1);
    }
  };

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
      {/* Image */}
      <Image
        src={image.url}
        alt={image.alt || 'Product image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Primary Badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <Star className="h-3 w-3" />
          Primary
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col">
        {/* Top Controls - Delete */}
        <div className="flex justify-end p-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Center Controls - Reorder */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleMoveLeft}
            disabled={index === 0}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="bg-background/90 px-3 py-1 rounded text-sm font-medium">
            {index + 1} / {totalImages}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleMoveRight}
            disabled={index === totalImages - 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Bottom Controls - Edit Alt */}
        <div className="p-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Edit Alt Text
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Image Alt Text</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe this image for accessibility"
                  />
                  <p className="text-xs text-muted-foreground">
                    Alt text helps screen readers and improves SEO. Describe
                    what's in the image.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleSaveAlt}>
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
