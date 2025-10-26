import { del } from "@vercel/blob";
import type { RentalProductImage } from "@/types/rental-product";

/**
 * Upload a single image to Vercel Blob via the upload API
 *
 * @param file - The file to upload
 * @returns Promise with the uploaded image data
 */
export async function uploadImage(file: File): Promise<RentalProductImage> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload image");
  }

  const data = await response.json();

  return {
    url: data.url,
    pathname: data.pathname,
    alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
    order: 0, // Will be set by the caller
  };
}

/**
 * Upload multiple images to Vercel Blob
 *
 * @param files - Array of files to upload
 * @returns Promise with array of uploaded image data
 */
export async function uploadMultipleImages(
  files: File[]
): Promise<RentalProductImage[]> {
  const uploadPromises = files.map((file, index) =>
    uploadImage(file).then((image) => ({
      ...image,
      order: index,
    }))
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete a single image from Vercel Blob storage
 *
 * @param url - The Vercel Blob URL to delete
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error("Failed to delete image from Vercel Blob:", error);
    // Don't throw - we don't want to block operations if blob deletion fails
  }
}

/**
 * Delete multiple images from Vercel Blob storage
 *
 * @param urls - Array of Vercel Blob URLs to delete
 */
export async function deleteMultipleImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(deleteImage));
}

/**
 * Reorder images by updating their order property
 *
 * @param images - Array of images to reorder
 * @returns Array of images with updated order
 */
export function reorderImages(
  images: RentalProductImage[]
): RentalProductImage[] {
  return images.map((image, index) => ({
    ...image,
    order: index,
  }));
}

/**
 * Validate file before upload
 *
 * @param file - File to validate
 * @returns Object with isValid flag and optional error message
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check if it's an image
  if (!file.type.startsWith("image/")) {
    return {
      isValid: false,
      error: "File must be an image",
    };
  }

  // Check file size (max 4.5 MB)
  const maxSize = 4.5 * 1024 * 1024; // 4.5 MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size must be less than 4.5 MB",
    };
  }

  return { isValid: true };
}

/**
 * Format file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
