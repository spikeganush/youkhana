import { StorefrontResponseProducts } from '@/types/general';

export const validateString = (
  value: unknown,
  maxLength: number
): value is string => {
  if (!value || typeof value !== 'string' || value.length > maxLength) {
    return false;
  }

  return true;
};

export const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Something went wrong';
  }

  return message;
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export async function fetchInstagramData() {
  try {
    const data = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,username,timestamp,permalink,thumbnail_url&access_token=${process.env.INSTAGRAM_TOKEN}`,
      {
        next: {
          revalidate: 86400,
        },
      }
    );
    const json = await data.json();
    return json.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function shopifyFetch(query: string, variables = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const endpoint = `${domain}/api/2023-10/graphql.json`;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token || !endpoint)
    throw new Error('Missing Shopify API credentials');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const json = await response.json();

    if (!json || typeof json !== 'object') {
      throw new Error('Invalid JSON response');
    }

    return json.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data from Shopify API');
  }
}
