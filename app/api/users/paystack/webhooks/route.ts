import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  notifyAdminsRealtime,
  notifyUserRealtime,
} from "@/lib/notifyUserRealtime";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import { clearCartForPayer, formatOrderNumber } from "@/lib/cartDB";
import { getAdminNotificationForStatus } from "@/lib/getAdminNotificationsForStatus";

export const runtime = "nodejs";

function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}

async function markOrderFailed(params: {
  orderId: string;
  reference?: string | null;
  reason?: string;
}) {
  const { orderId, reference } = params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      status: true,
      orderNumber: true,
      customerEmail: true,
      total: true,
      guestId: true,
    },
  });

  if (!order) return;

  const updated = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: { notIn: ["PAID", "FAILED", "CANCELLED", "DELIVERED"] },
    },
    data: {
      status: "FAILED",
      paymentMethod: "PAYSTACK",
      paymentRef: reference ?? null,
    },
  });

  if (updated.count > 0 && order.userId) {
    const orderRef = formatOrderNumber(order.orderNumber);

    const userNotif = getUserNotificationForStatus("FAILED", {
      orderId: order.id,
      orderRef,
    });

    if (userNotif) {
      await notifyUserRealtime({
        userId: order.userId ?? null,
        guestId: order.guestId ?? null,
        ...userNotif,
        link: `/orders/${order.orderNumber}`,
      });
    }

    const adminNotif = getAdminNotificationForStatus("FAILED", {
      orderId: order.id,
      orderRef,
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
}

export async function POST(req: Request) {
  const signature = req.headers.get("x-paystack-signature");
  const rawBody = await req.text();

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const data = event?.data;
  const orderId = data?.metadata?.orderId as string | undefined;
  const reference = data?.reference as string | undefined;
  const amountKobo = data?.amount as number | undefined;

  if (!orderId) {
    return NextResponse.json({ ok: true });
  }

  if (event?.event === "charge.failed") {
    await markOrderFailed({
      orderId,
      reference,
      reason: "Paystack charge failed",
    });

    return NextResponse.json({ ok: true });
  }

  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  if (!reference || typeof amountKobo !== "number") {
    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      userId: true,
      guestId: true,
      status: true,
      totalKobo: true,
      orderNumber: true,
      customerEmail: true,
      total: true,
    },
  });

  if (!order) return NextResponse.json({ ok: true });

  if (order.totalKobo !== amountKobo) {
    await markOrderFailed({
      orderId,
      reference,
      reason: "Amount mismatch",
    });

    return NextResponse.json({ ok: true });
  }

  const didPay = await prisma.$transaction(async (tx) => {
    const updatedPaid = await tx.order.updateMany({
      where: {
        id: orderId,
        status: { in: ["PENDING", "FAILED"] },
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: "PAYSTACK",
        paymentRef: reference,
      },
    });

    if (updatedPaid.count === 0) return false;

    await clearCartForPayer({
      tx: tx as any,
      userId: order.userId,
      guestId: order.guestId,
    });

    return true;
  });

  if (!didPay) return NextResponse.json({ ok: true });

  if (order.userId) {
    const orderRef = formatOrderNumber(order.orderNumber);

    const userNotif = getUserNotificationForStatus("PAID", {
      orderId: order.id,
      orderRef,
    });

    if (userNotif) {
      await notifyUserRealtime({
        userId: order.userId ?? null,
        guestId: order.guestId ?? null,
        ...userNotif,
        link: `/orders/${order.orderNumber}`,
      });
    }

    const adminNotif = getAdminNotificationForStatus("PAID", {
      orderId: order.id,
      orderRef,
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

  return NextResponse.json({ ok: true });
}
