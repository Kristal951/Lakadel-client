'use client'
import ProductCard from "@/components/shop/ProductCard";
import useProductStore from "@/store/productStore";

export default function ProductPage() {
  const { products } = useProductStore()

  return (
    <section className="w-full flex flex-col gap-8 px-4">
      <div className="flex flex-col gap-1 items-center">
        <h2 className="text-5xl text-foreground font-semibold tracking-tight">
          Our Products
        </h2>
        <p className="text-sm text-foreground">
          Discover all our top-notch products
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}
      </div>
    </section>
  );
}
