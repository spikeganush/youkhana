import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/upload
 *
 * Upload an image to Vercel Blob storage
 * Requires authentication and MANAGE_PRODUCTS permission
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user?.email || !session?.user?.role) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!hasPermission(session.user.role, 'MANAGE_PRODUCTS')) {
      return NextResponse.json(
        { error: 'Forbidden - Requires MANAGE_PRODUCTS permission' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 4.5 MB)
    const maxSize = 4.5 * 1024 * 1024; // 4.5 MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 4.5 MB' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `products/${timestamp}-${sanitizedFileName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Return the blob data
    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
