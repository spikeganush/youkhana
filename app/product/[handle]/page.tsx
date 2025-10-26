import Contact from '@/components/Contact/contact';
import ProductDetailImages from '@/components/Shop/product/Product-detail-images';
import ProductOptions from '@/components/Shop/product/Product-options';
import PurchaseButton from '@/components/Shop/product/Purchase-button';
import { getProductByHandle } from '@/lib/rental-products';
import { rentalProductToShopifyProduct } from '@/lib/product-transformer';
import { cleanHtml } from '@/lib/utils';

export default async function Product({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  // Fetch rental product from Redis
  const rentalProduct = await getProductByHandle(handle);
  if (!rentalProduct) {
    return <div>Product not found</div>;
  }

  // Transform to Shopify format for compatibility with existing components
  const product = rentalProductToShopifyProduct(rentalProduct);

  const htmlDescription = cleanHtml(product.descriptionHtml);

  return (
    <div className='px-6'>
      <div className='pt-20 flex flex-col md:flex-row justify-center'>
        {/* Image gallery */}
        <ProductDetailImages product={product} />

        {/* Product info */}
        <div className='max-w-lg px-4 pb-16 pt-10 sm:px-6'>
          <div className='lg:col-span-2 lg:pr-8'>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
              {product?.title}
            </h1>
          </div>

          {/* Price */}
          <div className='mt-4 lg:row-span-3 lg:mt-0'>
            <h2 className='sr-only'>Product information</h2>
            <p className='text-3xl tracking-tight text-gray-900'>
              {product?.priceRange.minVariantPrice.currencyCode}
              {Number(product?.priceRange.minVariantPrice.amount).toFixed(0)}
            </p>
          </div>

          {/* Options */}
          {product.options.length > 1 && <ProductOptions product={product} />}

          <div className='py-10 lg:col-span-2 lg:col-start-1 lg:pb-8 lg:pr-8 lg:pt-6'>
            {/* Description and details */}
            <div>
              <h3 className='sr-only'>Description</h3>

              <div className='space-y-6'>
                <div
                  className='handle-p text-base text-gray-900'
                  dangerouslySetInnerHTML={{
                    __html: htmlDescription,
                  }}
                />
              </div>
            </div>

            <div className='mt-10'>
              {/* Purchase button */}
              <PurchaseButton
                variants={product.variants}
                available={product.availableForSale}
              />
            </div>
          </div>
          <Contact productTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
