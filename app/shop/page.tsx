"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/shop/ProductCard";
import Spinner from "@/components/ui/spinner";
import useProductStore from "@/store/productStore";
import EmptyState from "@/components/ui/EmptyState";
import SortButton from "@/components/shop/SortButton";
import SelectCountryModal from "@/components/ui/SelectCountryModal";
import { useSession } from "next-auth/react";
import useUserStore from "@/store/userStore";

export default function Shop() {
  const { loading, error, fetchProducts, filteredAndSearchedProducts } =
    useProductStore();
  const { loggingOut } = useUserStore();

  const { status } = useSession();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (status === "loading") return;
    setShowModal(status !== "authenticated");
  }, [status]);

  const productsToShow = filteredAndSearchedProducts();

  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner w="10" h="10" />
      </div>
    );
  }

  if (loggingOut) {
    return (
      <div className="w-full fixed flex inset-0 bg-black/40 z-100 items-center justify-center">
        <Spinner w="10" h="10" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center flex-col justify-center">
        <EmptyState
          retry
          text="Failed to get products"
          onClick={fetchProducts}
          buttonText="Retry"
        />
      </div>
    );
  }

  if (productsToShow.length === 0) {
    return <EmptyState text="No products match your filters or search." />;
  }

  return (
    <div className="w-full flex flex-col h-full p-4">
      <SortButton />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {productsToShow.map((product, index) => (
          <ProductCard key={product.id} index={index} {...product} />
        ))}
      </div>

      {showModal && <SelectCountryModal />}
    </div>
  );
}
