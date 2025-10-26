'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RentalInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    handle: string;
  };
  selectedVariant?: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
  };
}

export function RentalInquiryDialog({
  open,
  onOpenChange,
  product,
  selectedVariant,
}: RentalInquiryDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate rental days if dates are provided
      let rentalDays: number | undefined;
      if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (rentalDays <= 0) {
          toast.error('End date must be after start date');
          setLoading(false);
          return;
        }
      }

      const response = await fetch('/api/rental-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone || undefined,
          selectedVariant: selectedVariant ? {
            id: selectedVariant.id,
            title: selectedVariant.title,
            options: selectedVariant.selectedOptions,
          } : undefined,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate || undefined,
          rentalDays,
          message: formData.message || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      toast.success(data.message || 'Inquiry submitted successfully!');

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        startDate: '',
        endDate: '',
        message: '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rent: {product.title}</DialogTitle>
          <DialogDescription>
            Fill out the form below to inquire about renting this item. We'll get back to you shortly!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Variant Info */}
          {selectedVariant && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-gray-700">Selected: {selectedVariant.title}</p>
              {selectedVariant.selectedOptions.map((option) => (
                <p key={option.name} className="text-gray-600">
                  {option.name}: {option.value}
                </p>
              ))}
            </div>
          )}

          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone (optional)</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Desired Start Date (optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Desired End Date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message / Special Requests (optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any special requests or questions?"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.message.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
