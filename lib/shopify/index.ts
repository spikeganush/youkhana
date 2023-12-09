'use server';

import {
  Connection,
  Image,
  Product,
  ShopifyMutationCheckoutCreateOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductsOperation,
} from '@/types/shopify/type';
import { getProductQuery, getProductsQuery } from './queries/product';
import { HIDDEN_PRODUCT_TAG, TAGS } from '../constants';
import { isShopifyError } from '../type-guards';
import { mutationCheckoutCreate } from './queries';

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;
const domain = process.env.SHOPIFY_STORE_DOMAIN;
const endpoint = `${domain}/api/2023-10/graphql.json`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch<T>({
  cache = 'no-store',
  headers,
  query,
  tags,
  variables,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!domain || !key || !endpoint)
      throw new Error('Missing Shopify API credentials');

    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache,
      ...(tags && { next: { tags } }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || 'unknown',
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

const removeEdgesAndNodes = (array: Connection<any>) => {
  if (!array) return [];
  return array.edges.map((edge) => edge?.node);
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  if (!flattened) return [];

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;
  const newProduct: Product = {
    ...rest,
    images: reshapeImages(images, product.title) as Image[],
    variants: removeEdgesAndNodes(variants),
  };

  return newProduct;
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    tags: [TAGS.products],
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

export async function getSingleHandleProduct(handle: string) {
  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    tags: [TAGS.products],
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product);
}

export async function getMutationCheckout(prevState: any, formData: FormData) {
  const variantId = formData.get('variantId') as string;
  console.log(variantId);
  if (!variantId) {
    throw new Error('Missing variantId');
  }
  const res = await shopifyFetch<ShopifyMutationCheckoutCreateOperation>({
    query: mutationCheckoutCreate,
    variables: {
      variantId,
    },
  });

  return res.body.data.checkoutCreate.checkout;
}
