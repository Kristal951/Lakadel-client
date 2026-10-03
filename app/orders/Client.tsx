"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Search, ShoppingBag, X } from "lucide-react";
import { Counts, Order } from "@/store/types";

const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

const moneyWhole = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

const tabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
];

const FLOW = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
];

type Tone = { text: string; bg: string; dot: string };

const statusTone: Record<string, Tone> = {
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

const neutralTone: Tone = {
  text: "text-foreground/70",
  bg: "bg-foreground/10",
  dot: "bg-foreground/50",
};

const Tracker = ({ status }: { status: string }) => {
  const current = FLOW.findIndex((s) => s.value === status);
  if (current === -1) return null;

  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
      {FLOW.map((step, i) => {
        const reached = i <= current;
        return (
          <li key={step.value} aria-current={i === current ? "step" : undefined}>
            <div
              className={`h-1 rounded-full ${reached ? "bg-foreground" : "bg-foreground/10"
                }`}
            />
            <span
              className={`mt-2 block text-[10px] font-semibold uppercase tracking-widest ${reached ? "text-foreground" : "text-foreground/35"
                }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
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
  const [search, setSearch] = useState("");

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.formattedOrderNumber.toLowerCase().includes(q) ||
        o.orderItems.some((i) => i.product?.name?.toLowerCase().includes(q)),
    );
  }, [orders, search]);

  const activeCount =
    (counts.PENDING ?? 0) + (counts.PAID ?? 0) + (counts.SHIPPED ?? 0);

  const isSearching = search.trim().length > 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <div className="mx-auto max-w-5xl md:px-6 px-3 py-10 lg:py-16">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Continue shopping
        </Link>

        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your orders
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Track deliveries and revisit past purchases.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/70"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by orderID  or product"
              aria-label="Search orders"
              className="w-full rounded-lg border border-foreground/30 bg-background py-3 pl-11 pr-10 text-sm outline-none transition placeholder:text-foreground/35 focus:border-foreground/70"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <dl className="mb-8 grid grid-cols-3 divide-x divide-foreground/40 rounded-3xl border border-foreground/40">
          {[
            { label: "Orders", value: String(counts.all) },
            { label: "Total spent", value: moneyWhole(totalSpent) },
            { label: "Active", value: String(activeCount) },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">
              <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/60">
                {stat.label}
              </dt>
              <dd className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-2xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <nav
          aria-label="Filter orders by status"
          className="-mx-6 mb-8 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex w-max gap-2">
            {tabs.map((tab) => {
              const isActive =
                tab.value === "" ? !activeStatus : activeStatus === tab.value;
              const tabCount =
                tab.value === ""
                  ? counts.all
                  : (counts[tab.value as keyof Counts] ?? 0);

              return (
                <li key={tab.label}>
                  <Link
                    href={tab.value ? `/orders?status=${tab.value}` : "/orders"}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/10 hover:border-foreground/30"
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isActive
                          ? "bg-background/20 text-background"
                          : "bg-foreground/10 text-foreground/70"
                        }`}
                    >
                      {tabCount}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {visibleOrders.length > 0 ? (
          <div className="space-y-5">
            {visibleOrders.map((order) => {
              const tone = statusTone[order.status] ?? neutralTone;
              const previewItems = order.orderItems.slice(0, 2);
              const remaining = order.orderItems.length - previewItems.length;
              const itemCount = order.orderItems.length;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-foreground/10 bg-background transition-colors hover:border-foreground/25"
                >
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 bg-foreground/3 px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="font-semibold tracking-tight">
                        {order.formattedOrderNumber}
                      </span>
                      <span className="text-foreground/55">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="text-foreground/55">
                        {itemCount} item{itemCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${tone.bg} ${tone.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                      {order.status}
                    </span>
                  </header>

                  <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_250px] lg:gap-10">
                    <div className="space-y-6">
                      <ul className="space-y-4">
                        {previewItems.map((item) => (
                          <li key={item.id} className="flex gap-4">
                            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-foreground/5">
                              <Image
                                src={item.product?.images?.[0] || "/placeholder.png"}
                                alt={item.product?.name || "Product image"}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-center">
                              <h3 className="line-clamp-2 text-base font-medium tracking-tight sm:text-lg">
                                {item.product?.name || "Unnamed product"}
                              </h3>
                              <p className="mt-1 text-sm text-foreground/55">
                                Qty {item.quantity}
                                {item.selectedSize ? ` · Size ${item.selectedSize}` : ""}
                              </p>
                              <p className="mt-2 text-base font-medium">
                                {money(item.unitPriceKobo)}
                                {item.quantity > 1 && (
                                  <span className="font-normal text-foreground/70">
                                    {" "}
                                    each
                                  </span>
                                )}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {remaining > 0 && (
                        <p className="text-sm text-foreground/50">
                          +{remaining} more item{remaining > 1 ? "s" : ""} in this
                          order
                        </p>
                      )}

                      <Tracker status={order.status} />
                    </div>

                    <div className="flex flex-col justify-between gap-6 border-t border-foreground/10 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">
                          Order total
                        </p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight">
                          {money(order.totalKobo)}
                        </p>
                      </div>

                      <Link
                        href={`/orders/${order.formattedOrderNumber}`}
                        className="group/btn flex items-center justify-between rounded-full bg-foreground px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-background transition hover:opacity-90"
                      >
                        {order.status === "SHIPPED" ? "Track shipment" : "View order"}
                        <ArrowUpRight
                          size={16}
                          className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-foreground/10 bg-foreground/4">
              <ShoppingBag size={26} className="text-foreground/30" />
            </div>

            <h2 className="text-xl font-medium tracking-tight">
              {isSearching
                ? "No matching orders"
                : activeStatus
                  ? `No ${activeStatus.toLowerCase()} orders`
                  : "No orders yet"}
            </h2>

            <p className="mt-2 max-w-sm text-sm text-foreground/55">
              {isSearching
                ? `Nothing matches "${search.trim()}". Try an order number or a product name.`
                : activeStatus
                  ? "Orders will show up here as they reach this stage."
                  : "When you place an order, it will show up here."}
            </p>

            {isSearching ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium transition hover:bg-foreground hover:text-background"
              >
                Clear search
              </button>
            ) : (
              <Link
                href="/shop"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium transition hover:bg-foreground hover:text-background"
              >
                Browse the shop
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Client;