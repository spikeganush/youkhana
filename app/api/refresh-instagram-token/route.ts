// app/api/refresh-instagram-token/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { redis } from '@/lib/redist';

// Define types for better type safety
type InstagramResponse = {
  access_token: string;
  expires_in: number;
};

type ErrorResponse = {
  error?: {
    message: string;
    type?: string;
    code?: number;
  };
};

export async function POST(request: Request) {
  try {
    const authHeader = headers().get('authorization');
    const webhookSecret = process.env.CONVEX_WEBHOOK_SECRET;

    // Better environment variable validation
    if (!webhookSecret) {
      console.error('Missing CONVEX_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // More secure authorization check
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('Unauthorized token refresh attempt');
      return NextResponse.json(
        { error: 'Unauthorized request' },
        { status: 401 }
      );
    }

    // Get current token with validation
    const currentToken: string =
      (await redis.get('instagram_token')) ||
      (process.env.INSTAGRAM_TOKEN as string);
    if (!currentToken) {
      console.error(
        'No Instagram token found in Redis or environment variables'
      );
      return NextResponse.json(
        { error: 'Instagram token not configured' },
        { status: 500 }
      );
    }

    // Use URL constructor for better URL handling
    const refreshUrl = new URL(
      'https://graph.instagram.com/refresh_access_token'
    );
    refreshUrl.searchParams.append('grant_type', 'ig_refresh_token');
    refreshUrl.searchParams.append('access_token', currentToken);

    const response = await fetch(refreshUrl.toString(), {
      next: { revalidate: 0 },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      console.error('Instagram API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      return NextResponse.json(
        {
          error: errorData.error?.message || 'Instagram API error',
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as InstagramResponse;

    // Use Promise.all for parallel Redis operations
    await Promise.all([
      redis.set('instagram_token', data.access_token),
      redis.set(
        'instagram_token_expires_at',
        Date.now() + data.expires_in * 1000
      ),
    ]);

    // Don't expose tokens in response
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error('Error refreshing Instagram token:', error);

    // More detailed error response
    return NextResponse.json(
      {
        error: 'Failed to refresh token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
