import RentalProductsCard from "@/components/Shop/Rental-Products-Card";
import { getAllProducts } from "@/lib/rental-products";

export const dynamic = "force-dynamic";

export default async function Rent() {
  // Get all active rental products
  const products = await getAllProducts({ status: 'active' });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 min-h-screen sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Rental Catalog
        </h1>
        <p className="mt-2 text-gray-600">
          Browse our collection of items available for rent
        </p>
      </div>
      <RentalProductsCard products={products} />
    </div>
  );
}
