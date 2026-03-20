"use client";

import Image from "next/image";
import { useEffect, useState, use } from "react"; // Added use here
import { IoBagOutline } from "react-icons/io5";
import useProductStore from "@/store/productStore";
import Spinner from "@/components/ui/spinner";
import EmptyState from "@/components/ui/EmptyState";
import useCartStore from "@/store/cartStore";
import { useToast } from "@/hooks/useToast";
import PriceContainer from "@/components/shop/PriceContainer";
import useUserStore from "@/store/userStore";
import { CartItem } from "@/store/types";
import { useRouter } from "next/navigation";
import { cld } from "@/lib";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);

  const { fetchProducts, getProductById, loading, error } = useProductStore();
  const { addToCart, loading: isLoading } = useCartStore();
  const { showToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>("");
  const [selectedColor, setSelectedColor] = useState<
    { name: string; hex: string } | undefined
  >();
  const { currency } = useUserStore();
  const router = useRouter();

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        product: product,
        selectedSize: selectedSize ?? undefined,
        selectedColor: selectedColor ?? undefined,
      });
      showToast("Item added to bag", "success");
      router.push("/shopping-bag");
    } catch (error) {
      showToast("Failed to add item to cart", "error");
      console.error("Add to cart error:", error);
    }
  };

  useEffect(() => {
    if (!id) return;

    const p = getProductById(id);
    if (p) {
      setProduct(p);
    } else {
      fetchProducts().then(() => {
        const fetched = getProductById(id);
        if (fetched) setProduct(fetched);
      });
    }
  }, [id, fetchProducts, getProductById]);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images?.[0] || null);
      setSelectedColor(product.colors?.[0] ?? null);
    }
  }, [product]);

  if (loading || !product)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner w="10" h="10" />
      </div>
    );

  if (error) return <EmptyState text={error} />;

  return (
    <section className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="flex flex-col gap-8">
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
          {selectedImage ? (
            <Image
              src={
                selectedImage.startsWith("http")
                  ? cld(selectedImage, 500)
                  : selectedImage
              }
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>

        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img: string) => (
              <div
                key={img}
                className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                  selectedImage === img
                    ? "border-(--accent,#B10E0E)"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="opacity-70">{product.description}</p>
        </div>

        <PriceContainer
          price={product.price}
          currency={currency}
          textSize="xl"
        />

        {product.sizes?.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-medium">Available Sizes:</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full border transition font-medium ${
                    selectedSize === size
                      ? "bg-(--accent,#B10E0E) text-white border-transparent"
                      : "border-foreground text-foreground hover:border-(--accent,#B10E0E)"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors.map((color: { name: string; hex: string }) => (
          <button
            key={color.hex}
            type="button"
            title={color.name}
            style={{ backgroundColor: color.hex }}
            className={`w-8 h-8 rounded-full border-2 transition ${
              selectedColor?.hex === color.hex
                ? "border-(--accent,#B10E0E)"
                : "border-transparent"
            }`}
            onClick={() => setSelectedColor(color)}
          />
        ))}

        <button
          onClick={handleAddToCart}
          disabled={!selectedSize || isLoading}
          className="mt-6 py-3 flex items-center justify-center gap-2 rounded-full text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--accent,#B10E0E)" }}
        >
          {isLoading ? (
            <Spinner w="5" h="5" />
          ) : (
            <>
              <IoBagOutline size={24} />
              <p> Add to Bag</p>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
