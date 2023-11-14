import { Product } from '@/types/shopify/type';
import Image from 'next/image';

export default function ProductsCard({ products }: { products: Product[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      {products.map((product) => {
        const image = product.images[0].url;
        const price = product.priceRange.minVariantPrice;

        return (
          <div className="group relative" key={product.id}>
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 duration-300">
              <Image
                src={image}
                alt={product.title}
                height={640}
                width={640}
                className="h-full w-full object-cover object-center lg:h-full lg:w-full group-hover:scale-110 duration-300"
              />
            </div>
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
              <p className="text-sm font-medium text-gray-900">{`${price.currencyCode}${price.amount}`}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
