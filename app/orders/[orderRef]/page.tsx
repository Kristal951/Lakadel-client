import type { Prisma } from "@prisma/client";
import { parseOrderRef } from "@/lib";
import { prisma } from "@/lib/prisma";
import OrderClient from "./OrderClient";
import OrderUnavailable from "./OrderUnavailable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

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


function parseAddress(value: Prisma.JsonValue): OrderDetail["shippingAddress"] {
  let v: Prisma.JsonValue = value;

  if (typeof v === "string") {
    try {
      v = JSON.parse(v) as Prisma.JsonValue;
    } catch {
      return null;
    }
  }
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;

  const a = v as Record<string, unknown>;
  const str = (k: string) =>
    typeof a[k] === "string" ? (a[k] as string) : undefined;

  return {
    fullName: str("fullName"),
    streetAddress: str("streetAddress"),
    landMark: str("landMark"),
    city: str("city"),
    state: str("state"),
    country: str("country"),
    postalCode: str("postalCode"),
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;
  const orderNumberParsed = parseOrderRef(orderRef);

  if (orderNumberParsed === null || orderNumberParsed === undefined) {
    return <OrderUnavailable issue="invalid" orderRef={orderRef} />;
  }

  const orderNumber = Number(orderNumberParsed);

  if (!Number.isInteger(orderNumber)) {
    return <OrderUnavailable issue="invalid" orderRef={orderRef} />;
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { orderItems: { include: { product: true } } },
  });

  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) redirect("/auth/login");

   if (!order || order.userId !== user.id) {
    return <OrderUnavailable issue="not_found" orderRef={orderRef} />;
  }

  const detail: OrderDetail = {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    paymentProvider: order.paymentMethod ?? null,
    shippingAddress: parseAddress(order.shippingAddress),
    subTotal: order.subTotal,
    shippingFee: order.shippingFee,
    totalKobo: order.totalKobo,
    orderItems: order.orderItems.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unitPriceKobo: i.unitPriceKobo,
      selectedSize: i.selectedSize,
      selectedColor: i.selectedColor,
      product: i.product
        ? { id: i.product.id, name: i.product.name, images: i.product.images }
        : null,
    })),
  };

  return <OrderClient order={detail} orderRef={orderRef} />;
}