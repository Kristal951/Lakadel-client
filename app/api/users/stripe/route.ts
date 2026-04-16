import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  notifyAdminsRealtime,
  notifyUserRealtime,
} from "@/lib/notifyUserRealtime";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import { formatOrderNumber } from "@/lib/cartDB";
import { getAdminNotificationForStatus } from "@/lib/getAdminNotificationsForStatus";
import { getGuestId } from "@/lib/guest";

export const runtime = "nodejs";

type Body = {
  orderId: string;
  userId?: string | null;
  guestId?: string | null;
  email?: string;
};

function getAppUrl() {
  const url =
    process.env.APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { orderId, userId, email } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 },
      );
    }

    const guestID = await getGuestId(); // ✅ FIXED

    const appUrl = getAppUrl();
    if (!appUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: APP_URL/NEXTAUTH_URL missing" },
        { status: 500 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        guestId: true,
        status: true,
        currency: true,
        customerEmail: true,
        paymentRef: true,
        orderNumber: true,
        total: true,
        orderItems: {
          select: { productId: true, quantity: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ AUTH CHECKS
    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!userId && order.guestId && guestID && order.guestId !== guestID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (order.status === "PAID") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 409 },
      );
    }

    if (!order.orderItems.length) {
      return NextResponse.json(
        { error: "Order has no items" },
        { status: 400 },
      );
    }

    const currency = (order.currency || "NGN").toLowerCase();

    const normalizedEmail =
      (email || order.customerEmail || "").trim().toLowerCase() || undefined;

    // ✅ FETCH PRODUCTS
    const productIds = [...new Set(order.orderItems.map((i) => i.productId))];

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, images: true, price: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const line_items = order.orderItems.map((i) => {
      const p = productMap.get(i.productId);
      if (!p) throw new Error("Product missing for an order item");

      const unit_amount = Math.round(Number(p.price) * 100);

      if (!Number.isFinite(unit_amount) || unit_amount <= 0) {
        throw new Error("Invalid unit price");
      }

      return {
        price_data: {
          currency,
          product_data: {
            name: p.name,
            images: p.images?.length ? [p.images[0]] : [],
            metadata: { productId: p.id },
          },
          unit_amount,
        },
        quantity: i.quantity,
      };
    });

    const idempotencyKey = `checkout:${order.id}`;

    // ✅ CREATE STRIPE SESSION
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: normalizedEmail,

        line_items,

        client_reference_id: order.id,

        metadata: {
          orderId: order.id,
          userId: order.userId ?? "",
          guestId: order.guestId ?? "",
        },

        payment_intent_data: {
          metadata: {
            orderId: order.id,
            userId: order.userId ?? "",
            guestId: order.guestId ?? "",
          },
        },

        success_url: `${appUrl}/checkout/success?provider=stripe&orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/shopping-bag`,
      },
      { idempotencyKey },
    );

    const userOrderRef = formatOrderNumber(order.orderNumber);
    const adminOrderRef = formatOrderNumber(order.orderNumber);

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "STRIPE",
        paymentRef: session.id,
        status: "PENDING",
      },
    });

    const firstTimeInit = !order.paymentRef;

    if (firstTimeInit && updatedOrder.userId) {
      const userNotif = getUserNotificationForStatus("PENDING", {
        orderId: order.id,
        orderRef: userOrderRef,
      });

      if (userNotif) {
        await notifyUserRealtime({
          userId: updatedOrder.userId ?? null,
          guestId: updatedOrder.guestId ?? null,
          ...userNotif,
          link: `/orders/${order.orderNumber}`,
        });
      }

      const adminNotif = getAdminNotificationForStatus("PENDING", {
        orderId: order.id,
        orderRef: adminOrderRef,
        customerEmail: order.customerEmail,
        total: order.total,
      });

      if (adminNotif) {
        await notifyAdminsRealtime({
          ...adminNotif,
          dedupeKeyPrefix: `admin:${adminNotif.action}:${order.id}`,
          link: `/admin/orders/${order.id}`,
        });
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Stripe init error:", e);

    return NextResponse.json(
      { error: e?.message || "Failed to initialize Stripe" },
      { status: 500 },
    );
  }
}
