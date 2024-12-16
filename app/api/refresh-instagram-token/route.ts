// app/api/refresh-instagram-token/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { redis } from '@/lib/redist';

export async function POST(request: Request) {
  try {
    // Verify the request is from Convex
    const authHeader = headers().get('authorization');
    if (authHeader !== `Bearer ${process.env.CONVEX_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current token from Redis or fallback to env
    const currentToken =
      (await redis.get('instagram_token')) || process.env.INSTAGRAM_TOKEN;

    // Refresh Instagram token
    const response = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Instagram API Error: ${response.status} - ${
          errorData.error?.message || 'Unknown error'
        }`
      );
    }

    const data = await response.json();

    // Store new token in Redis
    await redis.set('instagram_token', data.access_token);

    // Store expiration timestamp
    await redis.set(
      'instagram_token_expires_at',
      Date.now() + data.expires_in * 1000
    );

    return NextResponse.json({
      success: true,
      message: `Token refreshed successfully, new token: ${data.access_token}, previous token: ${currentToken}`,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
