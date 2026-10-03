"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  CreditCard,
  Download,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  PackageCheck,
  Phone,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  unitPriceKobo: number;
  selectedSize?: string | null;
  selectedColor?: unknown;
  product?: { id?: string; name?: string; images?: string[] } | null;
};

type OrderDetail = {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: string | Date;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  paymentProvider?: "PAYSTACK" | "STRIPE" | string | null;
  shippingAddress?: {
    fullName?: string;
    streetAddress?: string;
    landMark?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  } | null;
  subTotal: number;
  shippingFee: number;
  totalKobo: number;
  orderItems: OrderItem[];
};

const money = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

const STATUS: Record<string, { text: string; cls: string }> = {
  PENDING: { text: "Awaiting payment", cls: "bg-amber-500/10 text-amber-600 ring-amber-500/20" },
  FAILED: { text: "Payment failed", cls: "bg-rose-500/10 text-rose-600 ring-rose-500/20" },
  PAID: { text: "Paid", cls: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20" },
  SHIPPED: { text: "On its way", cls: "bg-blue-500/10 text-blue-600 ring-blue-500/20" },
  DELIVERED: { text: "Delivered", cls: "bg-foreground/10 text-foreground/70 ring-foreground/20" },
};
const fallbackStatus = (s: string) => ({
  text: s,
  cls: "bg-foreground/10 text-foreground/70 ring-foreground/20",
});

const COMPLETED: Record<string, number> = {
  PENDING: 1,
  FAILED: 1,
  PAID: 2,
  SHIPPED: 3,
  DELIVERED: 4,
};

const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Placed", icon: Check },
  { label: "Paid", icon: CreditCard },
  { label: "Shipped", icon: Truck },
  { label: "Delivered", icon: PackageCheck },
];

const BANNER: Record<string, { title: string; body: string }> = {
  PENDING: {
    title: "Waiting for payment",
    body: "Complete your payment and we'll start preparing your order.",
  },
  FAILED: {
    title: "Your payment didn't go through",
    body: "You haven't been charged for this attempt. You can try again below.",
  },
  PAID: {
    title: "Payment received",
    body: "We're preparing your order for shipping.",
  },
  SHIPPED: {
    title: "Your order is on its way",
    body: "It has left our hands and is heading to you.",
  },
  DELIVERED: {
    title: "Delivered",
    body: "Your order has arrived. We hope you love it.",
  },
};

const RECEIPT_STATUSES = ["PAID", "SHIPPED", "DELIVERED"];

function Tracker({ status }: { status: string }) {
  const completed = COMPLETED[status] ?? 1;
  const failed = status === "FAILED";

  return (
    <ol className="flex" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const done = i < completed;
        const active = i === completed && completed < STEPS.length;
        const isFailedStep = failed && active;
        const Icon = isFailedStep ? AlertCircle : step.icon;

        return (
          <li
            key={step.label}
            aria-current={active ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute left-[-50%] top-3.75 h-0.5 w-full ${
                  done ? "bg-emerald-500" : "bg-foreground/10"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors ${
                done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isFailedStep
                    ? "border-rose-500 text-rose-500"
                    : active
                      ? "border-foreground text-foreground"
                      : "border-foreground/15 text-foreground/30"
              }`}
            >
              {done ? <Check size={16} strokeWidth={3} /> : <Icon size={14} />}
            </span>
            <span
              className={`mt-2 text-[11px] font-semibold uppercase tracking-wider ${
                done || active ? "text-foreground" : "text-foreground/35"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const OrderClient = ({
  order,
  orderRef,
}: {
  order: OrderDetail;
  orderRef: string;
}) => {
  const status = STATUS[order.status] ?? fallbackStatus(order.status);
  const banner = BANNER[order.status];
  const addr = order.shippingAddress ?? {};
  const name = order.customerName || addr.fullName || "Customer";
  const canRetry = order.status === "PENDING" || order.status === "FAILED";
  const hasReceipt = RECEIPT_STATUSES.includes(order.status);

  const retryLock = useRef(false);
  const [retrying, setRetrying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  const addressLines = [
    addr.streetAddress,
    addr.landMark ? `Near ${addr.landMark}` : null,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.country, addr.postalCode].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(orderRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
    }
  };

  const handleRetryPayment = async () => {
    if (retryLock.current) return;
    retryLock.current = true;
    setRetrying(true);
    setActionError("");
    let redirecting = false;

    try {
      const isStripe = order.paymentProvider === "STRIPE";
      let guestId: string | null = null;
      try {
        guestId = localStorage.getItem("guestId");
      } catch {
        guestId = null;
      }

      const res = await fetch(
        isStripe ? "/api/users/stripe" : "/api/users/paystack/initialise",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isStripe
              ? { orderId: order.id, guestId, userId: null, email: order.customerEmail }
              : { orderId: order.id },
          ),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Could not restart payment.");

      const url: string | undefined = isStripe ? data?.url : data?.authorization_url;
      if (!url) throw new Error("No payment link was returned. Please try again.");

      redirecting = true; 
      window.location.href = url;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      if (!redirecting) {
        setRetrying(false);
        retryLock.current = false;
      }
    }
  };

  const downloadDocument = async () => {
    setDownloading(true);
    setActionError("");
    try {
      const kind = hasReceipt ? "receipt" : "invoice";
      const res = await fetch(`/api/users/orders/${order.id}/${kind}`);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${hasReceipt ? "Receipt" : "Invoice"}-${orderRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      setActionError("We couldn't prepare your document. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 md:py-8 py-4 sm:px-6 lg:py-12">
        <Link
          href="/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          All orders
        </Link>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {orderRef}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ring-1 ring-inset ${status.cls}`}
              >
                {status.text}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/60">
              <span className="inline-flex items-center gap-2">
                <Clock size={14} />
                Placed {formatDate(order.createdAt)}
              </span>
              <button
                type="button"
                onClick={copyRef}
                className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy order number"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={downloadDocument}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-foreground hover:text-background active:scale-95 disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloading
              ? "Preparing..."
              : hasReceipt
                ? "Download receipt"
                : "Download invoice"}
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-foreground/40 p-6 sm:p-8">
              <Tracker status={order.status} />

              {banner && (
                <div
                  className={`mt-8 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between ${
                    order.status === "FAILED"
                      ? "bg-rose-500/10"
                      : canRetry
                        ? "bg-amber-500/10"
                        : "bg-foreground/4"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{banner.title}</p>
                    <p className="mt-0.5 text-sm text-foreground/65">{banner.body}</p>
                  </div>

                  {canRetry && (
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      disabled={retrying}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-background transition hover:opacity-90 disabled:opacity-60"
                    >
                      {retrying ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Wallet size={14} />
                      )}
                      {retrying
                        ? "Redirecting..."
                        : order.status === "FAILED"
                          ? "Try payment again"
                          : "Complete payment"}
                    </button>
                  )}
                </div>
              )}

              {actionError && (
                <p
                  role="alert"
                  className="mt-4 flex items-start gap-2 text-sm text-rose-600"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {actionError}
                </p>
              )}
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Items ({order.orderItems.length})
              </h2>
              <ul className="divide-y divide-foreground/10 overflow-hidden rounded-3xl border border-foreground/40">
                {order.orderItems.map((item) => {
                  const productId = item.product?.id;
                  const color =
                    typeof item.selectedColor === "string" ? item.selectedColor : null;
                  const meta = [
                    `Qty ${item.quantity}`,
                    item.selectedSize ? `Size ${item.selectedSize}` : null,
                    color,
                  ].filter(Boolean);

                  return (
                    <li key={item.id} className="flex gap-4 p-4 sm:gap-6 sm:p-6">
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-foreground/5">
                        <Image
                          src={item.product?.images?.[0] ?? "/placeholder.png"}
                          alt={item.product?.name ?? "Product"}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-base font-medium sm:text-lg">
                              {item.product?.name ?? "Unavailable product"}
                            </h3>
                            <p className="mt-1 text-sm text-foreground/55">
                              {meta.join(" · ")}
                            </p>
                          </div>
                          <p className="shrink-0 text-base font-semibold">
                            {money(item.unitPriceKobo * item.quantity)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-foreground/55">
                          <span>
                            {item.quantity > 1 && `${money(item.unitPriceKobo)} each`}
                          </span>
                          {productId && (
                            <Link
                              href={`/products/${productId}`}
                              className="font-medium underline-offset-4 hover:text-foreground hover:underline"
                            >
                              View product
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-foreground/40 p-6">
              <h2 className="mb-5 text-lg font-semibold tracking-tight">Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-foreground/70">
                  <dt>Subtotal</dt>
                  <dd>{money(order.subTotal)}</dd>
                </div>
                <div className="flex justify-between text-foreground/70">
                  <dt>Shipping</dt>
                  <dd>
                    {order.shippingFee === 0 ? (
                      <span className="font-medium text-emerald-600">Free</span>
                    ) : (
                      money(order.shippingFee)
                    )}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-foreground/40 pt-4">
                  <dt className="font-semibold">Total</dt>
                  <dd className="text-2xl font-semibold tracking-tight">
                    {money(order.totalKobo)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="space-y-6 rounded-3xl border border-foreground/40 p-6">
              <div className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-foreground/15">
                  <MapPin size={18} className="text-foreground/70" />
                </span>
                <div className="min-w-0 text-sm">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-foreground">
                    Delivering to
                  </p>
                  <p className="font-medium">{name}</p>
                  {addressLines.map((line) => (
                    <p key={line} className="leading-relaxed text-foreground/70">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {(order.customerPhone || order.customerEmail) && (
                <div className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-foreground/15">
                    <Phone size={18} className="text-foreground/70" />
                  </span>
                  <div className="min-w-0 space-y-1 text-sm">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-foreground">
                      Contact
                    </p>
                    {order.customerPhone && (
                      <p className="text-foreground/80">{order.customerPhone}</p>
                    )}
                    {order.customerEmail && (
                      <p className="flex items-center gap-2 break-all text-foreground/70">
                        <Mail size={13} className="shrink-0" />
                        {order.customerEmail}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Link
              href={`/support?ref=${encodeURIComponent(orderRef)}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-foreground/40 py-4 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-foreground"
            >
              <MessageSquare size={16} />
              Need help with this order?
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderClient;