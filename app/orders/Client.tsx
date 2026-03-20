"use client";

import { Counts, Order } from "@/store/types";
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  ChevronRight,
  Clock,
  Hash,
  Layers,
  Search,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);

const tabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
];

const statusTone: Record<string, { text: string; bg: string; dot: string }> = {
  PENDING: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    dot: "bg-amber-500",
  },
  PAID: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  SHIPPED: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    dot: "bg-blue-500",
  },
  DELIVERED: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-500/10",
    dot: "bg-indigo-500",
  },
};

const Client = ({
  orders,
  counts,
  totalSpent,
  activeStatus,
}: {
  orders: Order[];
  counts: Counts;
  totalSpent: number;
  activeStatus?: string;
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="mb-14 flex flex-col gap-8 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 text-sm text-foreground/70 transition hover:border-foreground/20 hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <h1 className="text-5xl font-medium tracking-[-0.06em] sm:text-6xl">
              Orders<span className="text-foreground/35">.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-foreground/60">
              Review your order history, track shipments, and inspect every
              purchase from one clean archive.
            </p>
          </div>

          <div className="group relative w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 transition-colors group-focus-within:text-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search index..."
              className="w-full rounded-2xl border border-foreground/10 bg-background py-4 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-foreground/35 focus:border-foreground/25"
            />
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-4xl border border-foreground/10 bg-background p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/70">
              Total Orders
            </p>
            <p className="mt-3 text-3xl font-medium tracking-tight">
              {counts.all}
            </p>
          </div>

          <div className="rounded-4xl border border-foreground/10 bg-background p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/70">
              Total Spent
            </p>
            <p className="mt-3 text-3xl font-medium tracking-tight">
              {money(totalSpent)}
            </p>
          </div>

          <div className="rounded-4xl border border-foreground/10 bg-background p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/70">
              Active Orders
            </p>
            <p className="mt-3 text-3xl font-medium tracking-tight">
              {counts.PENDING + counts.PAID + counts.SHIPPED}
            </p>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-2 gap-3 md:grid-cols-5">
          {tabs.map((tab) => {
            const isActive =
              tab.value === "" ? !activeStatus : activeStatus === tab.value;

            const tabCount =
              tab.value === ""
                ? counts.all
                : counts[tab.value as keyof Counts];

            return (
              <Link
                key={tab.label}
                href={tab.value ? `/orders?status=${tab.value}` : "/orders"}
                className={`group rounded-[1.75rem] border p-4 transition-all ${
                  isActive
                    ? "border-foreground/30 bg-foreground text-background"
                    : "border-foreground/10 bg-background hover:border-foreground/25"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                    isActive
                      ? "text-background/70"
                      : "text-foreground/70 group-hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </span>

                <div className="mt-6 flex items-end justify-between">
                  <span className="text-2xl font-light tracking-tight">
                    {String(tabCount).padStart(2, "0")}
                  </span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform group-hover:translate-x-1 ${
                      isActive ? "text-background/70" : "text-foreground/30"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {orders.length > 0 ? (
          <div className="space-y-10">
            {orders.map((order) => {
              const tone = statusTone[order.status] ?? statusTone.PENDING;
              const previewItems = order.orderItems.slice(0, 2);
              const remainingItems = order.orderItems.length - previewItems.length;

              return (
                <div
                  key={order.id}
                  className="group grid overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-background lg:grid-cols-[1fr_350px]"
                >
                  <div className="p-8 lg:p-10">
                    <div className="mb-10 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-foreground/70">
                      <span className="inline-flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-1.5 text-foreground/70">
                        <Hash size={12} />
                        {order.formattedOrderNumber}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Clock size={12} />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Layers size={12} />
                        {order.orderItems.length} item
                        {order.orderItems.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-8">
                      {previewItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-5 p-4 sm:gap-6 sm:p-5"
                        >
                          <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-3xl border border-foreground/8 bg-foreground/5 sm:h-36 sm:w-28">
                            <Image
                              src={item.product?.images?.[0] || "/placeholder.png"}
                              alt={item.product?.name || "Product image"}
                              fill
                              sizes="112px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <h3 className="line-clamp-2 text-xl font-medium tracking-tight sm:text-2xl">
                              {item.product?.name || "Unnamed product"}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-foreground/55">
                              <span>Qty: {item.quantity}</span>
                              {item.selectedSize && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-foreground/25" />
                                  <span>Size: {item.selectedSize}</span>
                                </>
                              )}
                            </div>

                            <p className="mt-4 text-lg font-medium tracking-tight">
                              {money(item.unitPriceKobo)}
                            </p>
                          </div>
                        </div>
                      ))}

                      {remainingItems > 0 && (
                        <div className="px-4 sm:px-5">
                          <p className="text-sm text-foreground/50">
                            +{remainingItems} more item
                            {remainingItems > 1 ? "s" : ""} in this order
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-t border-foreground/10 bg-foreground/3 p-8 lg:border-l lg:border-t-0 lg:p-10">
                    <div className="space-y-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/70">
                            Statement Total
                          </p>
                          <p className="text-3xl font-medium tracking-tight sm:text-4xl">
                            {money(order.totalKobo)}
                          </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/10 bg-background">
                          <ShieldCheck
                            size={18}
                            className="text-foreground/70"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-foreground/10 bg-background px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Box size={16} className="text-foreground/70" />
                          <span className="text-xs font-medium text-foreground/70">
                            Status
                          </span>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${tone.bg} ${tone.text}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                          />
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.formattedOrderNumber}`}
                      className="group/btn mt-10 flex w-full items-center justify-between rounded-[1.75rem] bg-foreground px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-background transition-all hover:opacity-90"
                    >
                      Track Shipment
                      <ArrowUpRight
                        size={18}
                        className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                      />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-32 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-foreground/10 bg-foreground/4">
              <ShoppingBag size={30} className="text-foreground/25" />
            </div>

            <h2 className="text-2xl font-medium tracking-tight">
              The archive is vacant.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-foreground/55">
              No orders were found for this view yet.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-3 text-sm font-medium transition hover:bg-foreground hover:text-background"
            >
              Start Exploring
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Client;