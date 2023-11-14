import ProductCard from '@/components/Shop/Product-Card';
import { productsQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/utils';
import { StorefrontResponseProducts } from '@/types/general';

export default async function Shop() {
  const data: StorefrontResponseProducts = await shopifyFetch(productsQuery);
  const products = data?.products?.edges;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {products.map((item) => {
          const product = item.node;
          return <ProductCard product={product} key={product.id} />;
        })}
      </div>
    </div>
  );
}
