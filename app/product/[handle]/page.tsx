import Contact from "@/components/Contact/contact";
import ProductDetailImages from "@/components/Shop/product/Product-detail-images";
import ProductOptions from "@/components/Shop/product/Product-options";
import PurchaseButton from "@/components/Shop/product/Purchase-button";
import { getProductByHandle } from "@/lib/rental-products";
import { rentalProductToShopifyProduct } from "@/lib/product-transformer";
import { NovelViewer } from "@/components/admin/novel-viewer";
import { Badge } from "@/components/ui/badge";

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

  // Transform to Shopify format for compatibility with image gallery and options components
  const product = rentalProductToShopifyProduct(rentalProduct);

  return (
    <div className="px-6">
      <div className="pt-20 flex flex-col md:flex-row justify-center">
        {/* Image gallery */}
        <ProductDetailImages product={product} />

        {/* Product info */}
        <div className="max-w-lg px-4 pb-16 pt-10 sm:px-6">
          <div className="lg:col-span-2 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {rentalProduct.title}
            </h1>

            {/* Category and Status Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">{rentalProduct.category}</Badge>
              {rentalProduct.featured && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Rental Price */}
          <div className="mt-6 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Rental information</h2>
            <div className="space-y-2">
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                ${rentalProduct.rentalPrice.daily.toFixed(2)}
                <span className="text-lg font-normal text-gray-600">/day</span>
              </p>

              {/* Weekly and Monthly Rates */}
              {(rentalProduct.rentalPrice.weekly ||
                rentalProduct.rentalPrice.monthly) && (
                <div className="text-sm text-gray-600 space-y-1">
                  {rentalProduct.rentalPrice.weekly && (
                    <p>${rentalProduct.rentalPrice.weekly.toFixed(2)}/week</p>
                  )}
                  {rentalProduct.rentalPrice.monthly && (
                    <p>${rentalProduct.rentalPrice.monthly.toFixed(2)}/month</p>
                  )}
                </div>
              )}

              {/* Security Deposit */}
              {rentalProduct.deposit && (
                <p className="text-sm text-gray-600 mt-2">
                  Security Deposit:{" "}
                  <span className="font-medium text-gray-900">
                    ${rentalProduct.deposit.toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Availability:{" "}
              <span className="font-medium text-gray-900">
                {rentalProduct.availableQuantity} of{" "}
                {rentalProduct.totalQuantity} available
              </span>
            </p>
          </div>

          {/* Options */}
          {product.options.length > 1 && <ProductOptions product={product} />}

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:pb-8 lg:pr-8 lg:pt-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Description
              </h3>

              {rentalProduct.shortDescription && (
                <p className="text-base text-gray-700 font-medium mb-4">
                  {rentalProduct.shortDescription}
                </p>
              )}

              <div className="prose prose-sm max-w-none text-gray-600">
                <NovelViewer content={rentalProduct.description} />
              </div>
            </div>

            {/* Specifications */}
            {rentalProduct.specifications &&
              Object.keys(rentalProduct.specifications).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Specifications
                  </h3>
                  <dl className="space-y-2">
                    {Object.entries(rentalProduct.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between text-sm border-b border-gray-200 pb-2"
                        >
                          <dt className="text-gray-600 font-medium">{key}</dt>
                          <dd className="text-gray-900">{value}</dd>
                        </div>
                      )
                    )}
                  </dl>
                </div>
              )}

            {/* Rental Terms */}
            {(rentalProduct.minRentalDays ||
              rentalProduct.maxRentalDays ||
              rentalProduct.terms) && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Rental Terms
                </h3>

                {(rentalProduct.minRentalDays ||
                  rentalProduct.maxRentalDays) && (
                  <p className="text-sm text-gray-600 mb-2">
                    {rentalProduct.minRentalDays &&
                      `Minimum rental: ${rentalProduct.minRentalDays} days`}
                    {rentalProduct.minRentalDays &&
                      rentalProduct.maxRentalDays &&
                      " • "}
                    {rentalProduct.maxRentalDays &&
                      `Maximum rental: ${rentalProduct.maxRentalDays} days`}
                  </p>
                )}

                {rentalProduct.terms && (
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {rentalProduct.terms}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            {rentalProduct.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {rentalProduct.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10">
              {/* Rental button */}
              <PurchaseButton
                variants={product.variants}
                available={product.availableForSale}
                productId={rentalProduct.id}
                productTitle={rentalProduct.title}
                productHandle={rentalProduct.handle}
              />
            </div>
          </div>
          {/* <Contact productTitle={rentalProduct.title} /> */}
        </div>
      </div>
    </div>
  );
}
