import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUserRealtime } from "@/lib/notifyUserRealtime";
import { formatOrderNumber } from "@/lib/cartDB";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

async function expirePendingOrdersJob() {
  const expiryMinutes = Number(process.env.PENDING_ORDER_EXPIRY_MINUTES ?? 30);

  if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0) {
    throw new Error("Invalid PENDING_ORDER_EXPIRY_MINUTES value");
  }

  const cutoff = new Date(Date.now() - expiryMinutes * 60 * 1000);
  const candidates = await prisma.order.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      userId: true,
      orderNumber: true,
      createdAt: true,
      status: true,
      guestId: true
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (candidates.length === 0) {
    console.log("[expire-pending-orders] no expired pending orders found", {
      expiryMinutes,
      cutoff: cutoff.toISOString(),
    });

    return {
      ok: true,
      expiryMinutes,
      cutoff: cutoff.toISOString(),
      scannedCount: 0,
      expiredCount: 0,
      notifiedCount: 0,
      skippedCount: 0,
    };
  }

  const expiredOrders: Array<{
    id: string;
    userId: string | null;
    orderNumber: number | null;
    guestId: string | null;
  }> = [];

  let skippedCount = 0;

  for (const order of candidates) {
    const updated = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: "PENDING",
        createdAt: { lt: cutoff },
      },
      data: {
        status: "FAILED",
      },
    });

    if (updated.count === 1) {
      expiredOrders.push({
        id: order.id,
        userId: order.userId,
        orderNumber: order.orderNumber,
        guestId: order.guestId
      });
    } else {
      skippedCount += 1;
    }
  }

  const notificationResults = await Promise.allSettled(
    expiredOrders.map(async (order) => {
      if (!order.userId) return false;

      if (!order.orderNumber) return;
      const orderRef = formatOrderNumber(order.orderNumber);
      const notif = getUserNotificationForStatus("FAILED", {
        orderId: order.id,
        orderRef,
      });
      const targetId = order.userId ?? null;
      const guestId = order.guestId ?? null;

      if (!targetId && !guestId) return;

      if (!notif) return false;

      await notifyUserRealtime({
        userId: targetId,
        guestId: guestId,
        ...notif,
        link: `/orders/${order.orderNumber}`,
      });

      return true;
    }),
  );

  const notifiedCount = notificationResults.filter(
    (r) => r.status === "fulfilled" && r.value === true,
  ).length;

  const notificationErrors = notificationResults
    .filter((r) => r.status === "rejected")
    .map((r) => (r as PromiseRejectedResult).reason);

  if (notificationErrors.length > 0) {
    console.error(
      "[expire-pending-orders] notification errors",
      notificationErrors,
    );
  }

  return {
    ok: true,
    expiryMinutes,
    cutoff: cutoff.toISOString(),
    scannedCount: candidates.length,
    expiredCount: expiredOrders.length,
    skippedCount,
    notifiedCount,
  };
}

async function handle(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await expirePendingOrdersJob();
    return NextResponse.json(result);
  } catch (error) {
    console.error("expire-pending-orders route error:", error);
    return NextResponse.json(
      { error: "Failed to expire pending orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
