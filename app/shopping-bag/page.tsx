"use client";

import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Heart,
  X,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoBagOutline } from "react-icons/io5";
import { useMemo, useState } from "react";
import useUserStore from "@/store/userStore";
import PriceContainer from "@/components/shop/PriceContainer";
import useCartStore from "@/store/cartStore";

export default function ShoppingBag() {
  const { currency } = useUserStore();
  const { items } = useCartStore();
  const router = useRouter();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const cartItems = items ?? [];

  const { increaseQty, decreaseQty, removeFromCart } = useCartStore();

  const goToShop = () => router.push("/shop");

  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product?.price ?? 0);
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <section className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="bg-background p-16 rounded-[3rem] flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 bg-foreground border border-foreground rounded-full flex items-center justify-center shadow-sm mb-6">
            <IoBagOutline size={32} className="text-background" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            Your Shopping bag is empty
          </h2>
          <p className="text-foreground/70 mt-3 mb-8">
            Discovery awaits! Explore our latest arrivals and find something
            you'll love.
          </p>
          <button
            onClick={goToShop}
            className="w-full py-4 border border-foreground bg-background text-foreground rounded-full font-semibold hover:bg-foreground hover:text-background transition-all"
          >
            Explore Shop
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto py-12 px-6 lg:px-12 animate-in fade-in duration-700">
      <button
        onClick={goToShop}
        className="flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground mb-8 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Continue Shopping
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Shopping Bag
          </h1>
          <p className="text-foreground/50 mt-2 text-lg font-medium">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready
            to ship
          </p>
        </div>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={16} />
            Clear Bag
          </button>
        ) : (
          <div className="flex items-center gap-3 animate-in slide-in-from-right-4">
            <span className="text-sm font-semibold">Are you sure?</span>
            <button
              onClick={() => {
                setShowClearConfirm(false);
              }}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-xs bg-neutral-200 px-3 py-1.5 rounded-full"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-25 items-start">
        <div className="lg:col-span-8 space-y-10">
          {cartItems.map((item) => {
            console.log(item);
            const imgSrc = item.product?.images?.[0] || "/placeholder.png";
            const name = item.product?.name ?? "Product";
            const price = item.product?.price ?? 0;

            return (
              <div
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor?.hex || "no-color"}`}
                className="group relative flex flex-col sm:flex-row gap-8 border-0 border-b pb-6"
              >
                <div className="relative w-full sm:w-48 aspect-4/5 bg-neutral-100 rounded-4xl overflow-hidden">
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="flex-1 flex flex-col py-2">
                  <div className="flex md:justify-between flex-col md:flex-row gap-1 items-start mb-1">
                    <h3 className="text-2xl font-bold text-foreground leading-tight">
                      {name}
                    </h3>
                    <PriceContainer
                      price={price}
                      currency={currency}
                      textSize="2xl"
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm uppercase tracking-wider font-semibold text-foreground/60">
                    {item.selectedSize && (
                      <span>
                        Size:{" "}
                        <span className="text-foreground">
                          {item.selectedSize}
                        </span>
                      </span>
                    )}
                    {item.selectedColor && (
                      <span>
                        Color:{" "}
                        <span className="text-foreground">
                          {item.selectedColor.name}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-8 flex items-center justify-between">
                    <div className="flex items-center bg-background border border-neutral-100 rounded-full p-1.5 shadow-sm">
                      <button
                        onClick={() =>
                          decreaseQty(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor?.hex ?? null,
                          )
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-foreground/20 rounded-full transition-all disabled:opacity-20"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="w-12 text-center font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQty(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor?.hex ?? null,
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-foreground/20 rounded-full transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-3 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-red-500 border border-transparent hover:border-neutral-100">
                        <Heart size={20} />
                      </button>
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.productId,
                            item.selectedSize,
                            item.selectedColor?.hex ?? null,
                          )
                        }
                        className="p-3 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-black border border-transparent hover:border-neutral-100 disabled:opacity-60"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-foreground text-background p-8 rounded-[2.5rem]">
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>

            <div className="space-y-5 mb-8">
              <div className="flex justify-between text-background/60 font-medium">
                <span>Subtotal</span>
                <PriceContainer
                  price={totalPrice}
                  currency={currency}
                  textSize="2xl"
                  textColor="background"
                />
              </div>
              <div className="flex justify-between text-background/60 font-medium">
                <span>Shipping</span>
                <span className="text-green-400">Calculated at checkout</span>
              </div>

              <div className="pt-6 border-t border-background flex justify-between items-end">
                <span className="text-neutral-400 font-medium">
                  Total Amount
                </span>
                <span className="text-3xl font-bold tracking-tighter text-background">
                  <PriceContainer
                    price={totalPrice}
                    currency={currency}
                    textSize="2xl"
                    textColor="background"
                  />
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/shopping-bag/checkout")}
              className="w-full bg-white text-black py-5 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all duration-300 group active:scale-[0.98]"
            >
              Proceed to Checkout
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="bg-neutral-50 p-6 rounded-4xl border border-neutral-100">
            <div className="flex items-center gap-4 text-neutral-600 mb-4">
              <ShieldCheck size={24} className="text-neutral-900" />
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  Secure Checkout
                </p>
                <p className="text-xs">Your data is always protected.</p>
              </div>
            </div>
            <div className="flex gap-3 grayscale opacity-50">
              <div className="h-6 w-10 bg-neutral-300 rounded" />
              <div className="h-6 w-10 bg-neutral-300 rounded" />
              <div className="h-6 w-10 bg-neutral-300 rounded" />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
