import ProductsCard from '@/components/Shop/Products-Card';
import SearchBar from '@/components/Shop/Search-Bar';
import { getProducts } from '@/lib/shopify';

export const dynamic = 'force-dynamic';

export default async function Shop() {
  const products = await getProducts({});

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 min-h-screen sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <ProductsCard products={products} />
    </div>
  );
}
