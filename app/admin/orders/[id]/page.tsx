// app/admin/orders/[id]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { StatusBadge } from "@/components/admin/DashboardWidgets";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  User2,
  MapPin,
  Phone,
  Mail,
  Package,
  CreditCard,
  Hash,
  Clock3,
} from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import Image from "next/image";
import { parseSelectedColor } from "@/lib";
import { formatOrderNumber } from "@/lib/cartDB";
import { StatusUpdater } from "@/components/admin/StatusUpdater";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatMoney(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

function koboToMajor(kobo: number) {
  return Number(kobo || 0) / 100;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) redirect("/login");
  if (user.role !== "ADMIN") redirect("/shop");
}

export default async function AdminOrderDetailsPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      total: true,
      totalKobo: true,
      currency: true,
      createdAt: true,
      paidAt: true,
      paymentRef: true,
      paymentMethod: true,
      subTotal: true,
      shippingFee: true,
      orderNumber: true,

      customerName: true,
      customerEmail: true,
      customerPhone: true,

      shippingAddress: true,

      user: {
        select: {
          name: true,
          email: true,
        },
      },

      orderItems: {
        select: {
          id: true,
          quantity: true,
          unitPriceKobo: true,
          lineTotalKobo: true,
          selectedColor: true,
          selectedSize: true,
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              sku: true,
            },
          },
        },
      },
    },
  });

  if (!order) notFound();

  const addr = order.shippingAddress as any | null;

  const customerName =
    order.customerName ?? order.user?.name ?? addr?.fullName ?? "Customer";

  const customerEmail =
    order.customerEmail ?? order.user?.email ?? addr?.email ?? "—";

  const customerPhone = order.customerPhone ?? addr?.phone ?? "—";

  const itemsTotal =
    order.orderItems?.reduce(
      (sum, it) => sum + koboToMajor(it.lineTotalKobo ?? 0),
      0,
    ) ?? 0;

  const shippingFee = Number(order.shippingFee ?? 0);
  const computedTotal = itemsTotal + shippingFee;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Order #{formatOrderNumber(order.orderNumber)}
              </h1>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-foreground/55">
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Created {new Date(order.createdAt).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-2">
                <Hash className="h-4 w-4" />
                ID: {order.id.slice(-8)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/api/admin/orders/${order.id}/receipt`}
              className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              <Receipt className="h-4 w-4" />
              Download Receipt
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            <section className="overflow-hidden rounded-4xl border border-foreground/10 bg-background">
              <div className="flex items-center justify-between border-b border-foreground/8 px-6 py-5 sm:px-8">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground/45">
                    Items Purchased
                  </h2>
                  <p className="mt-1 text-sm text-foreground/50">
                    {order.orderItems.length} item{order.orderItems.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-foreground/8">
                {order.orderItems.map((item) => {
                  const product = item.product;
                  const unitPrice = koboToMajor(item.unitPriceKobo ?? 0);
                  const lineTotal = koboToMajor(item.lineTotalKobo ?? 0);
                  const image = product?.images?.[0] ?? "/placeholder.png";
                  const c = parseSelectedColor(item.selectedColor);

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-5 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/4">
                          <Image
                            src={image}
                            alt={product?.name ?? "Product"}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-base font-semibold text-foreground">
                            {product?.name ?? "Product Deleted"}
                          </p>

                          <p className="font-mono text-sm text-foreground/45">
                            {product?.sku ? `SKU: ${product.sku}` : "SKU unavailable"}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.selectedSize && (
                              <span className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/60">
                                Size: {item.selectedSize}
                              </span>
                            )}

                            <span className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/60">
                              Qty: {item.quantity}
                            </span>

                            {item.selectedColor && (
                              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/60">
                                {c?.hex ? (
                                  <span
                                    className="h-3 w-3 rounded-full border border-black/10"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ) : null}
                                {c?.name || c?.hex || "Selected"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-35 rounded-2xl border border-foreground/8 bg-foreground/3 p-4 text-left md:text-right">
                        <p className="text-xs text-foreground/45">Unit Price</p>
                        <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                          {formatMoney(unitPrice, order.currency)}
                        </p>

                        <p className="mt-3 text-xs text-foreground/45">Line Total</p>
                        <p className="mt-1 font-mono text-sm font-bold text-foreground">
                          {formatMoney(lineTotal, order.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            <section className="overflow-hidden rounded-4xl border border-foreground/10 bg-background">
              <div className="border-b border-foreground/8 px-6 py-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground/45">
                  Order Status
                </h2>
              </div>

              <div className="p-6">
                <StatusUpdater orderId={order.id} currentStatus={order.status} />
              </div>
            </section>

            <section className="overflow-hidden rounded-4xl border border-foreground/10 bg-background">
              <div className="border-b border-foreground/8 px-6 py-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground/45">
                  Summary
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-foreground/50">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </span>
                  <span className="font-semibold text-foreground">
                    {order.paymentMethod ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Order Number</span>
                  <span className="font-semibold text-foreground">
                    {order.orderNumber ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground/50">Payment Ref</span>
                  <span className="font-mono font-semibold text-foreground">
                    {order.paymentRef ?? "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-foreground/50">
                    <Calendar className="h-4 w-4" />
                    Paid At
                  </span>
                  <span className="text-right font-semibold text-foreground">
                    {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}
                  </span>
                </div>

                <div className="h-px bg-foreground/10" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Items Total</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(itemsTotal, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Shipping Fee</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(shippingFee, order.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/50">Computed Total</span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatMoney(computedTotal, order.currency)}
                  </span>
                </div>

                <div className="h-px bg-foreground/10" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground/65">Total</span>
                  <span className="font-mono text-lg font-extrabold text-foreground">
                    {formatMoney(order.total, order.currency)}
                  </span>
                </div>

                <p className="text-xs text-foreground/40">
                  TotalKobo: {order.totalKobo.toLocaleString()}
                </p>
              </div>
            </section>

            <section className="overflow-hidden rounded-4xl border border-foreground/10 bg-background">
              <div className="border-b border-foreground/8 px-6 py-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-foreground/45">
                  Customer
                </h2>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <User2 className="mt-0.5 h-5 w-5 text-foreground/40" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {customerName}
                    </p>
                  </div>
                </div>

                <p className="flex items-center gap-2 text-sm text-foreground/70">
                  <Mail className="h-4 w-4 text-foreground/40" />
                  {customerEmail}
                </p>

                <p className="flex items-center gap-2 text-sm text-foreground/70">
                  <Phone className="h-4 w-4 text-foreground/40" />
                  {customerPhone}
                </p>

                {addr ? (
                  <>
                    <div className="h-px bg-foreground/10" />
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-foreground/40" />
                      <div className="text-sm text-foreground/70">
                        <p className="font-semibold text-foreground">
                          Shipping Address
                        </p>
                        <p>{addr?.address1 ?? "—"}</p>
                        <p>{(addr?.city ?? "—") + ", " + (addr?.state ?? "—")}</p>
                        <p>{addr?.country ?? "—"}</p>
                        {addr?.landmark ? <p>Landmark: {addr.landmark}</p> : null}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}