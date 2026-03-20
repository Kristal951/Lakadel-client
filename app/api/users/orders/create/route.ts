import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/cartDB";
import { Prisma } from "@prisma/client";

function badRequest(message: string, extra?: any) {
  return NextResponse.json({ error: message, ...extra }, { status: 400 });
}

function normalizeCurrency(value?: string) {
  const c = String(value || "NGN")
    .trim()
    .toUpperCase();
  const allowed = new Set(["NGN", "USD", "GBP", "EUR"]);
  return allowed.has(c) ? c : "NGN";
}

function normalizeSelectedColor(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === null || value === undefined || value === "") {
    return Prisma.JsonNull;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed as Prisma.InputJsonValue;
    } catch {
      return { name: value };
    }
  }

  if (typeof value === "object") {
    return value as Prisma.InputJsonValue;
  }

  return Prisma.JsonNull;
}

type CartItemInput = {
  productId: string;
  quantity: number;
  selectedColor?: { name: string; hex: string } | null;
  selectedSize?: string | null;
};

type ShippingAddressInput = {
  fullName?: string;
  address1?: string;
  address2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

function isColorObj(v: any): v is { name: string; hex: string } {
  return (
    v &&
    typeof v === "object" &&
    typeof v.name === "string" &&
    typeof v.hex === "string"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const userId = body.userId ? String(body.userId) : null;
    const phone = String(body.phone || "").trim();
    const currency = normalizeCurrency(body.currency);
    const name = String(body?.name);

    const shippingAddress: ShippingAddressInput | null =
      body.shippingAddress && typeof body.shippingAddress === "object"
        ? body.shippingAddress
        : null;

    const cartItems: CartItemInput[] = Array.isArray(body.items)
      ? body.items
      : [];

    if (!email) return badRequest("email is required");
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return badRequest("items is required");

    for (const item of cartItems) {
      if (!item?.productId)
        return badRequest("Each item.productId is required");
      if (!Number.isInteger(item.quantity) || item.quantity < 1)
        return badRequest("Each item.quantity must be an integer >= 1");
      if (item.selectedColor != null && !isColorObj(item.selectedColor))
        return badRequest(
          "selectedColor must be { name: string; hex: string } or null",
        );
      if (item.selectedSize != null && typeof item.selectedSize !== "string")
        return badRequest("selectedSize must be a string");
    }

    const productIds = [...new Set(cartItems.map((i) => String(i.productId)))];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });

    const priceMap = new Map(products.map((p) => [p.id, Number(p.price)]));

    const missing = productIds.filter((id) => !priceMap.has(id));
    if (missing.length) {
      return badRequest("Some products no longer exist", { missing });
    }
    const computedTotal = cartItems.reduce((sum, item) => {
      const unitPrice = priceMap.get(String(item.productId))!;
      return sum + unitPrice * item.quantity;
    }, 0);

    const totalMinor = Math.round(computedTotal * 100);
    const orderNumber = await generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          customerEmail: email,
          customerPhone: phone || null,
          customerName: name,
          currency,
          orderNumber,
          status: "PENDING",

          total: computedTotal,
          totalKobo: totalMinor,

          shippingAddress: shippingAddress ? (shippingAddress as any) : null,

          orderItems: {
            create: cartItems.map((i) => {
              const unitPriceMajor = priceMap.get(String(i.productId))!;
              const unitPriceKobo = Math.round(unitPriceMajor * 100);
              const lineTotalKobo = unitPriceKobo * i.quantity;

              return {
                product: { connect: { id: String(i.productId) } },
                quantity: i.quantity,
                price: unitPriceMajor,
                selectedColor: normalizeSelectedColor(i.selectedColor),
                selectedSize: i.selectedSize ?? null,
                unitPriceKobo,
                lineTotalKobo,
              };
            }),
          },
        },
        select: { id: true, total: true, currency: true },
      });

      return created;
    });

    return NextResponse.json(
      { orderId: order.id, total: order.total, currency: order.currency },
      { status: 201 },
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Failed to create order" },
      { status: 500 },
    );
  }
}
