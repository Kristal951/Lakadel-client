"use client";

import Image from "next/image";
import Link from "next/link";
import { CiHeart } from "react-icons/ci";
import { IoBagOutline } from "react-icons/io5";
import { FiArrowUpLeft } from "react-icons/fi";
import { useState } from "react";

import { useToast } from "@/hooks/useToast";
import useUserStore from "@/store/userStore";
import useCartStore from "@/store/cartStore";
import { Product } from "@/store/types";
import { cld } from "@/lib";
import PriceContainer from "./PriceContainer";

export default function ProductCard(props: Product & { index?: number }) {
  const { id, name, images, price, sizes, colors, description, index = 999 } = props;

  const { showToast } = useToast();
  const { currency } = useUserStore();
  const { addToCart } = useCartStore();

  const [showOverlay, setShowOverlay] = useState(false); // touch devices only
  const [adding, setAdding] = useState(false);

  const img0 = images?.[0] ?? "/placeholder.png";
  const isRemote = /^(https?:)?\/\//.test(img0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (adding) return;

    setAdding(true);
    try {
      await addToCart({
        productId: id,
        quantity: 1,
        selectedSize: sizes?.[0] ?? null,
        selectedColor: colors?.[0] ?? undefined,
        product: props,
      });
      showToast("Item added to bag", "success");
    } catch (error) {
      showToast("Failed to add item to cart", "error");
      console.error("Add to cart error:", error);
    } finally {
      setAdding(false);
    }
  };

  // Overlay visibility:
  // - desktop: hover / keyboard focus, with a short hover-in delay (hover intent), instant-ish out
  // - mobile: tap toggles it
  const overlayState = [
    "opacity-0 pointer-events-none",
    "md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:delay-200",
    "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
    showOverlay ? "max-md:opacity-100 max-md:pointer-events-auto" : "",
  ].join(" ");

  // Content slides up slightly after the dimming starts
  const contentState = [
    "translate-y-3 opacity-0",
    "md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:delay-300",
    "group-focus-within:translate-y-0 group-focus-within:opacity-100",
    showOverlay ? "max-md:translate-y-0 max-md:opacity-100" : "",
  ].join(" ");

  return (
    <div className="group relative mb-6 flex flex-col gap-3 p-0 md:mb-0 md:p-4">
      <div
        onClick={() => setShowOverlay((prev) => !prev)}
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm"
      >
        <Image
          src={isRemote ? cld(img0, 500) : img0}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={index < 4}
          className="object-cover transition-transform duration-1400 ease-out md:group-hover:scale-105 md:group-hover:delay-100"
        />

        <div
          className={`absolute inset-0 flex flex-col justify-end bg-black/40 p-4 transition-opacity duration-500 ease-out ${overlayState}`}
        >
          {/* <div
            className={`flex justify-end transition-all duration-500 ease-out ${contentState}`}
          >
            <button
              type="button"
              aria-label="Add to wishlist"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <CiHeart className="h-6 w-6 md:h-8 md:w-8" />
            </button>
          </div> */}

          <div
            className={`flex flex-row items-center justify-between gap-4 md:gap-2 transition-all duration-500 ease-out ${contentState}`}
          >
            <Link
              href={`/products/${id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center gap-1 rounded-full border border-white/20 bg-white/20 md:px-4 py-2 text-center text-[10px] font-bold text-white backdrop-blur-lg transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto md:text-xs"
            >
              <FiArrowUpLeft className="h-4 w-4" />
              <p className="hidden md:block">Details</p>
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="flex w-full items-center justify-center gap-1 rounded-full bg-white md:px-4 py-2 text-[10px] font-bold text-black shadow-xl transition-all hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 disabled:opacity-60 sm:w-auto md:text-xs"
            >
              <IoBagOutline className="h-4 w-4" />
              <p className="hidden md:block">
                {adding ? "Adding..." : "Add to bag"}
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1 px-1">
        <h3 className="line-clamp-1 text-sm font-bold uppercase leading-tight text-foreground md:text-base">
          {name}
        </h3>
        <p className="line-clamp-1 md:text-sm text-xs text-foreground/70">{description}</p>
        <div className="pt-1">
          <PriceContainer price={price} currency={currency} />
        </div>
      </div>
    </div>
  );
}