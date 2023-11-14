export type InstagramMedia = {
  id: string;
  media_url: string;
  media_type: string;
  permalink: string;
  caption: string;
  timestamp: string;
  username: string;
  thumbnail_url?: string;
};

export interface Product {
  id: string;
  title: string;
  handle: string;
  tags: string[];
  description: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
}

export interface ProductEdge {
  node: Product;
}

export interface Products {
  edges: ProductEdge[];
}

export interface StorefrontResponseProducts {
  products: Products;
}
