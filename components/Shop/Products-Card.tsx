import { Product } from '@/types/shopify/type';
import Link from 'next/link';
import ProductCardImage from './Product-Card-Image';

export function ProductCard({ product }: { product: Product }) {
  const price = product.priceRange.minVariantPrice;

  return (
    <Link href={`/product/${product.handle}`}>
      <div className="group relative">
        <ProductCardImage product={product} />
        <div className="mt-4 flex justify-between">
          <div>
            <h3 className="text-sm text-gray-700">
              <a href="#">
                <span aria-hidden="true" className="absolute inset-0" />
                {product.title}
              </a>
            </h3>
            {/* <p className="mt-1 text-sm text-gray-500">Black</p> */}
          </div>
          <p className="text-sm font-medium text-gray-900">{`${
            price.currencyCode
          }${Number(price.amount).toFixed()}`}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsCard({ products }: { products: Product[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      {products.map((product) => {
        return <ProductCard product={product} key={product.id} />;
      })}
    </div>
  );
}
