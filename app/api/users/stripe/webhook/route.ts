import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  notifyAdminsRealtime,
  notifyUserRealtime,
} from "@/lib/notifyUserRealtime";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import { clearCartForPayer, formatOrderNumber } from "@/lib/cartDB";
import { getAdminNotificationForStatus } from "@/lib/getAdminNotificationsForStatus";

export const runtime = "nodejs";

async function handlePaidNotification(order: {
  id: string;
  userId: string | null;
  orderNumber: number;
  customerEmail: string;
  total: number;
}) {
  const userOrderRef = formatOrderNumber(order.orderNumber);
  const adminOrderRef =formatOrderNumber(order.orderNumber)

  if (order.userId) {
    const userNotif = getUserNotificationForStatus("PAID", {
      orderId: order.id,
      orderRef: userOrderRef,
    });

    if (userNotif) {
      await notifyUserRealtime({
        userId: order.userId,
        ...userNotif,
        link: `/orders/${order.orderNumber}`,
      });
    }
  }

  const adminNotif = getAdminNotificationForStatus("PAID", {
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

async function handleFailedNotification(order: {
  id: string;
  userId: string | null;
  orderNumber: number;
  customerEmail: string;
  total: number;
}) {
  const userOrderRef = formatOrderNumber(order.orderNumber);
    const adminOrderRef =formatOrderNumber(order.orderNumber)

  if (order.userId) {
    const userNotif = getUserNotificationForStatus("FAILED", {
      orderId: order.id,
      orderRef: userOrderRef,
    });

    if (userNotif) {
      await notifyUserRealtime({
        userId: order.userId,
        ...userNotif,
        link: `/orders/${order.orderNumber}`,
      });
    }
  }

  const adminNotif = getAdminNotificationForStatus("FAILED", {
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

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature" },
      { status: 400 },
    );
  }

  if (!secret) {
    return NextResponse.json(
      { error: "Server misconfigured: STRIPE_WEBHOOK_SECRET missing" },
      { status: 500 },
    );
  }

  let event: any;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const orderId =
        session?.metadata?.orderId || session?.client_reference_id || null;

      if (!orderId) {
        console.warn("Stripe session missing orderId");
        return NextResponse.json({ received: true });
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          guestId: true,
          orderNumber: true,
          status: true,
          customerEmail: true,
          total: true,
        },
      });

      if (!order) return NextResponse.json({ received: true });

      const didPay = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: { id: orderId, status: { not: "PAID" } },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "STRIPE",
            paymentRef: paymentIntentId || session.id,
          },
        });

        if (updated.count === 0) return false;

        await clearCartForPayer({
          tx: tx as any,
          userId: order.userId,
          guestId: order.guestId,
        });

        return true;
      });

      if (didPay) {
        await handlePaidNotification({
          id: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          total: order.total,
        });
      }
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as any;

      const orderId = pi?.metadata?.orderId ?? null;
      if (!orderId) return NextResponse.json({ received: true });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          guestId: true,
          orderNumber: true,
          status: true,
          customerEmail: true,
          total: true,
        },
      });

      if (!order) return NextResponse.json({ received: true });

      const didPay = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: { id: orderId, status: { not: "PAID" } },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentMethod: "STRIPE",
            paymentRef: typeof pi.id === "string" ? pi.id : undefined,
          },
        });

        if (updated.count === 0) return false;

        await clearCartForPayer({
          tx: tx as any,
          userId: order.userId,
          guestId: order.guestId,
        });

        return true;
      });

      if (didPay) {
        await handlePaidNotification({
          id: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          total: order.total,
        });
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as any;

      const orderId = pi?.metadata?.orderId ?? null;
      if (!orderId) return NextResponse.json({ received: true });

      const updated = await prisma.order.updateMany({
        where: { id: orderId, status: { not: "PAID" } },
        data: {
          status: "FAILED",
          paymentMethod: "STRIPE",
          paymentRef: typeof pi.id === "string" ? pi.id : undefined,
        },
      });

      if (updated.count === 0) return NextResponse.json({ received: true });

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          userId: true,
          orderNumber: true,
          customerEmail: true,
          total: true,
        },
      });

      if (order) {
        await handleFailedNotification({
          id: order.id,
          userId: order.userId,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          total: order.total,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler failed:", err?.message);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
