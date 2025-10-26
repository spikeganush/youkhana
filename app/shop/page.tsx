/**
 * @deprecated This file uses Shopify integration which is no longer active.
 * Kept for reference only. See /app/rent/* for rental product implementation.
 * The business has shifted from selling to renting products.
 */

import ProductsCard from "@/components/Shop/Products-Card";
import { getProducts } from "@/lib/shopify";

export const dynamic = "force-dynamic";

export default async function Shop() {
  const products = await getProducts({});

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 min-h-screen sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <ProductsCard products={products} />
    </div>
  );
}
