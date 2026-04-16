"use client";

import Spinner from "@/components/ui/spinner";
import {
  Phone,
  MapPin,
  Check,
  Truck,
  PackageCheck,
  ShieldCheck,
  Download,
  MessageSquare,
  RefreshCw,
  Clock,
  Hash,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";

const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);

type LoadingStates = {
  retry: boolean;
  doc: boolean;
  support: boolean;
};

type OrderForDownload = {
  id: string;
  orderNumber: number;
  status: string;
};
function formatOrderNumber(orderNumber: number) {
  return `LKD-${orderNumber.toString().padStart(6, "0")}`;
}

const statusLabel = (s: string) => {
  const map: Record<string, { text: string; cls: string }> = {
    PAID: {
      text: "Paid",
      cls: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
    },
    PENDING: {
      text: "Awaiting Payment",
      cls: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
    },
    FAILED: {
      text: "Payment Failed",
      cls: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
    },
    SHIPPED: {
      text: "In Transit",
      cls: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
    },
    DELIVERED: {
      text: "Delivered",
      cls: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20",
    },
  };
  return (
    map[s] || { text: s, cls: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/20" }
  );
};

const STEPS = [
  { id: "PAID", label: "Confirmed", icon: ShieldCheck },
  { id: "SHIPPED", label: "Shipping", icon: Truck },
  { id: "DELIVERED", label: "Delivered", icon: PackageCheck },
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

  const [loadingStates, setLoadingStates] = useState({
    retry: false,
    doc: false,
    support: false,
  });

  const currentWeight = statusWeight[order.status] || 0;
  const progressWidth =
    currentWeight <= 1 ? 0 : ((currentWeight - 1) / (STEPS.length - 1)) * 100;

  const handleRetryPayment = async () => {
    try {
      setLoadingStates((s) => ({ ...s, retry: true }));
      const res = await fetch("/api/users/paystack/initialise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to retry payment");
      window.location.href = data.authorization_url;
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoadingStates((s) => ({ ...s, retry: false }));
    }
  };

  const downloadOrderDocument = async ({
    order,
    setLoadingStates,
  }: {
    order: OrderForDownload;
    setLoadingStates: React.Dispatch<React.SetStateAction<LoadingStates>>;
  }) => {
    try {
      setLoadingStates((s) => ({ ...s, doc: true }));

      const isPaid = order.status === "PAID";
      const url = isPaid
        ? `/api/users/orders/${order.id}/receipt`
        : `/api/users/orders/${order.id}/invoice`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = isPaid
        ? `Receipt-${formatOrderNumber(order.orderNumber)}.pdf`
        : `Invoice-${formatOrderNumber(order.orderNumber)}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setLoadingStates((s) => ({ ...s, doc: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button
          onClick={() => router.back()}
          className="group mb-12 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/60 transition-colors hover:text-foreground "
        >
          <IoArrowBackOutline className="text-base transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-13">
          <div className="lg:col-span-9 space-y-8">
            <section className="relative overflow-hidden rounded-4xl border bg-background border-foreground/20 p-8 flex flex-col justify-center shadow-sm">
              <div className="flex flex-col md:flex-row items-center  justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-light tracking-tight sm:text-5xl">
                      Order <span className="font-medium">#{orderRef}</span>
                    </h1>
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${pill.cls}`}
                    >
                      {pill.text}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/70">
                    <span className="flex items-center gap-2">
                      <Clock size={14} />{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Hash size={14} /> REF: {order.orderNumber}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      downloadOrderDocument({ order, setLoadingStates })
                    }
                    disabled={loadingStates.doc}
                    className="
    group flex-1 md:flex-none
    inline-flex items-center justify-center gap-2
    px-6 py-3.5 rounded-xl
    text-[11px] font-bold uppercase tracking-[0.18em]

    border border-[#b10e0e]/20
    text-[#b10e0e]
    bg-white

    hover:bg-[#b10e0e]
    hover:text-white

    transition-all duration-300
    active:scale-95
    disabled:opacity-60
  "
                  >
                    {loadingStates.doc ? (
                      <Spinner w="5" h="5" />
                    ) : (
                      <Download
                        size={16}
                        className={`
      transition-all duration-300
       group-hover:translate-y-px
    `}
                      />
                    )}

                    {loadingStates.doc
                      ? "Preparing..."
                      : order.status === "PAID"
                        ? "Download Receipt"
                        : "Download Invoice"}
                  </button>
                </div>
              </div>

              <div className="mt-16 relative px-4">
                <div className="absolute top-6 left-10 right-10 h-0.5 bg-emerald-200" />
                <div
                  className="absolute top-6 left-10 h-0.5 bg-emerald-500 transition-all duration-1000 ease-in-out"
                  style={{ width: `calc(${progressWidth}% - 20px)` }}
                />

                <div className="relative flex justify-between">
                  {STEPS.map((step) => {
                    const weight = statusWeight[step.id];
                    const isDone = currentWeight > weight;
                    const isActive = currentWeight === weight;
                    const Icon = step.icon;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center group"
                      >
                        <div
                          className={`
                          relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                          ${
                            isDone
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : isActive
                                ? "bg-background border-emerald-500 text-emerald-500 scale-110 shadow-xl"
                                : "bg-background border-emerald-200 text-zinc-300"
                          }
                        `}
                        >
                          {isDone ? (
                            <Check size={20} strokeWidth={3} />
                          ) : (
                            <Icon size={20} />
                          )}
                        </div>
                        <span
                          className={`mt-4 text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-emerald-600" : "text-zinc-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="px-2 text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
                Inventory Contents
              </h2>
              <div className="overflow-hidden rounded-4xl border bg-background border-foreground/20">
                <ul className="divide-y divide-foreground/20">
                  {order.orderItems.map((item: any) => (
                    <li key={item.id} className="group p-6 transition-colors">
                      <div className="flex gap-6">
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-background">
                          <Image
                            src={
                              item.product?.images?.[0] ?? "/placeholder.png"
                            }
                            alt="Product"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium">
                                {item.product?.name}
                              </h3>
                              <p className="text-sm text-foreground/60 mt-1">
                                Qty:{" "}
                                <span className="text-foreground font-medium mr-1">
                                  {item.quantity}
                                </span>
                                • Size:{" "}
                                <span className="text-foreground font-medium">
                                  {" "}
                                  {item.selectedSize && ` ${item.selectedSize}`}
                                </span>
                              </p>
                            </div>
                            <span className="font-mono text-base font-semibold">
                              {money(item.unitPriceKobo * item.quantity)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground/80 flex items-center gap-1">
                              View Details <ChevronRight size={12} />
                            </button>
                            {["PENDING", "FAILED"].includes(order.status) && (
                              <button
                                onClick={handleRetryPayment}
                                className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2"
                              >
                                <RefreshCw
                                  size={12}
                                  className={
                                    loadingStates.retry ? "animate-spin" : ""
                                  }
                                />
                                Retry Payment
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <h2 className="px-2 text-[11px] font-black uppercase tracking-[0.3em] text-foreground">
              Order Summary
            </h2>

            <div className="rounded-[2.5rem] border bg-background border-foreground/20 p-8 shadow-sm space-y-8">
              <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span className="font-mono">{money(order.subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Shipping</span>
                  <span className="font-mono text-emerald-600">
                    +{money(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Total Amount
                  </span>
                  <span className="text-3xl font-bold tracking-tighter font-mono">
                    {money(order.totalKobo)}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center border border-foreground/80">
                    <MapPin size={18} className="text-foreground/80" />
                  </div>
                  <div className="text-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Shipping To
                    </p>
                    <p className="font-medium">{name}</p>
                    <p className="text-foreground/80 leading-relaxed">
                      {shippingAddress.streetAddress}, {shippingAddress.city}
                      <br />
                      {shippingAddress.state}, {shippingAddress.country}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="-10 w-10 shrink-0 rounded-xl bg-background flex items-center justify-center border border-foreground/80">
                    <Phone size={18} className="text-foreground/80" />
                  </div>
                  <div className="text-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">
                      Contact Info
                    </p>
                    <p className="text-foreground/80">{order.customerPhone}</p>
                    <p className="text-foreground/90 text-xs truncate w-48">
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(`/support?ref=${orderRef}`)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-foreground/60 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground hover:border-foreground transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                Need Help?
              </button>
            </div>

            <div className="rounded-4xl bg-foreground p-6 text-background overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-10">
                <ShieldCheck size={120} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-background/80 mb-2">
                Support Token
              </p>
              <p className="text-2xl font-mono tracking-tight">{orderRef}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderClient;
