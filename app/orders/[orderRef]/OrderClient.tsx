"use client";

import {
  Mail,
  MapPin,
  Phone,
  Check,
  Truck,
  PackageCheck,
  ShieldCheck,
  Download,
  MessageSquare,
  RefreshCw,
  Clock,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(kobo / 100);

const statusLabel = (s: string) => {
  switch (s) {
    case "PAID":
      return {
        text: "Paid",
        cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
      };
    case "PENDING":
      return {
        text: "Awaiting Payment",
        cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
      };
    case "FAILED":
      return {
        text: "Payment Failed",
        cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
      };
    case "SHIPPED":
      return {
        text: "In Transit",
        cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
      };
    case "DELIVERED":
      return {
        text: "Delivered",
        cls: "bg-foreground/10 text-foreground/70 ring-foreground/15",
      };
    default:
      return {
        text: s,
        cls: "bg-foreground/10 text-foreground/70 ring-foreground/15",
      };
  }
};

const STEPS = [
  { id: "PAID", label: "Confirmed", icon: <ShieldCheck size={18} /> },
  { id: "SHIPPED", label: "In Transit", icon: <Truck size={18} /> },
  { id: "DELIVERED", label: "Arrived", icon: <PackageCheck size={18} /> },
];

const statusWeight: Record<string, number> = {
  PENDING: 0,
  FAILED: 0,
  PAID: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

const OrderClient = ({ order, orderRef }: { order: any; orderRef: string }) => {
  const router = useRouter();
  const pill = statusLabel(order.status);
  const shippingAddress = order.shippingAddress ?? {};
  const name = order.customerName || shippingAddress.fullName || "Customer";
  const [retrying, setRetrying] = useState(false);

  const currentWeight = statusWeight[order.status] || 0;

  const handleRetryPayment = async () => {
    try {
      setRetrying(true);

      const res = await fetch("/api/users/paystack/initialise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to retry payment");

      window.location.href = data.authorization_url;
    } catch (error: any) {
      alert(error.message || "Unable to retry payment");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <button
          onClick={() => router.back()}
          className="group mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45 transition hover:text-foreground"
        >
          <IoArrowBackOutline className="text-sm transition-transform group-hover:-translate-x-1" />
          Back to Archives
        </button>

        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-background">
          <div className="border-b border-foreground/8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                    #{orderRef}
                  </h1>

                  <span
                    className={`inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ring-1 ring-inset ${pill.cls}`}
                  >
                    {pill.text}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/50">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>

                  <span className="inline-flex items-center">
                    <Hash size={14} />
                    Ref: {order.orderNumber}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-background px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] transition hover:bg-foreground/4">
                  <Download size={16} />
                  Invoice
                </button>

                <button className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-background transition hover:opacity-90">
                  <MessageSquare size={16} />
                  Support
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-3xl">
              <div className="relative flex justify-between items-center">
                <div className="absolute left-6 right-6 top-6 h-0.5 bg-foreground/10" />
                <div
                  className="absolute left-6 top-6 h-0.5 bg-emerald-500 transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.max(0, ((currentWeight - 1) / (STEPS.length - 1)) * 100)}%`,
                  }}
                />

                {STEPS.map((step) => {
                  const stepValue = statusWeight[step.id];

                  const isCompleted = currentWeight > stepValue;
                  const isCurrent = currentWeight === stepValue;
                  const isUpcoming = currentWeight < stepValue;

                  return (
                    <div
                      key={step.id}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={[
                          "flex h-12 w-12 items-center justify-center rounded-full border-4 bg-background transition-all duration-500",
                          isCompleted && "border-emerald-500 text-emerald-500",
                          isCurrent &&
                            "border-emerald-500 text-emerald-500 animate-pulse",
                          isUpcoming &&
                            "border-foreground/10 text-foreground/30",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isCompleted ? (
                          <Check size={20} strokeWidth={3} />
                        ) : (
                          step.icon
                        )}
                      </div>

                      <span
                        className={[
                          "mt-4 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                          isCompleted || isCurrent
                            ? "text-foreground"
                            : "text-foreground/40",
                        ].join(" ")}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          <div className="space-y-5 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/45">
                Inventory
              </h2>
              <span className="text-xs text-foreground/45">
                {order.orderItems.length} item
                {order.orderItems.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="overflow-hidden rounded-4xl border border-foreground/10 bg-background">
              <ul className="divide-y divide-foreground/6">
                {order.orderItems.map((item: any) => {
                  const img = item.product?.images?.[0] ?? "/placeholder.png";

                  return (
                    <li key={item.id} className="p-5 sm:p-6">
                      <div className="flex gap-4 sm:gap-6">
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-foreground/8 bg-foreground/4 sm:h-28 sm:w-24">
                          <Image
                            src={img}
                            alt={item.product?.name || "Product image"}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 py-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-lg font-medium tracking-tight">
                                {item.product?.name}
                              </h3>

                              <p className="mt-1 text-sm text-foreground/55">
                                {item.quantity} unit
                                {item.quantity > 1 ? "s" : ""}
                                {item.selectedSize
                                  ? ` • Size: ${item.selectedSize}`
                                  : ""}
                              </p>
                            </div>

                            <p className="shrink-0 font-mono text-sm font-medium text-foreground sm:text-base">
                              {money(item.unitPriceKobo * item.quantity)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <button className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45 transition hover:text-foreground">
                              Archive Detail
                            </button>

                            {["PENDING", "FAILED"].includes(order.status) && (
                              <button
                                onClick={handleRetryPayment}
                                disabled={retrying}
                                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 transition hover:opacity-80 disabled:opacity-50 dark:text-emerald-400"
                              >
                                <RefreshCw
                                  size={12}
                                  className={retrying ? "animate-spin" : ""}
                                />
                                {retrying ? "Retrying..." : "Retry Payment"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-6 col-span-3">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/45">
              Statement
            </h2>

            <div className="space-y-6 rounded-4xl border w-full border-foreground/10 bg-background p-6 shadow-sm sm:p-8">
              <div className="space-y-4 border-b border-foreground/8 pb-6">
                <div className="flex items-center justify-between text-sm text-foreground/55">
                  <span>Subtotal</span>
                  <span className="font-mono text-foreground">
                    {money(order.subTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-foreground/55">
                  <span>Logistics</span>
                  <span className="font-mono text-foreground">
                    {money(order.shippingFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 text-lg font-medium text-foreground">
                  <span>Total</span>
                  <span className="font-mono text-2xl tracking-tight">
                    {money(order.totalKobo)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-foreground/8 bg-foreground/3 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-background p-2.5 ring-1 ring-foreground/8">
                      <MapPin size={16} className="text-foreground/45" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45">
                      Destination
                    </p>
                  </div>

                  <div className="text-sm leading-6 text-foreground/70">
                    <p className="font-medium text-foreground">{name}</p>
                    <p>{shippingAddress.streetAddress || "—"}</p>
                    <p>
                      {shippingAddress.city || "—"}
                      {shippingAddress.state
                        ? `, ${shippingAddress.state}`
                        : ""}
                    </p>
                    <p>{shippingAddress.country || "—"}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-foreground/8 bg-foreground/3 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-background p-2.5 ring-1 ring-foreground/8">
                      <Phone size={16} className="text-foreground/45" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/45">
                      Contact
                    </p>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-foreground/70">
                      {order.customerPhone || "—"}
                    </p>
                    <p className="break-all text-foreground/45">
                      {order.customerEmail || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-4xl bg-foreground p-6 text-background">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-background/60">
                Support Reference
              </p>
              <p className="font-mono text-lg tracking-tight">{orderRef}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderClient;
