import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  notifyAdminsRealtime,
  notifyUserRealtime,
} from "@/lib/notifyUserRealtime";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import { formatOrderNumber } from "@/lib/cartDB";
import { getAdminNotificationForStatus } from "@/lib/getAdminNotificationsForStatus";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => null);

    const orderId = body?.orderId as string | undefined;
    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        orderNumber: true,
        customerEmail: true,
        total: true
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (
      (session?.user?.id && order.userId && session.user.id !== order.userId) ||
      session?.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.order.updateMany({
      where: {
        id: orderId,
        status: { in: ["PENDING"] },
      },
      data: {
        status: "CANCELLED",
      },
    });

    if (updated.count > 0 && order.userId) {
      const orderRef = formatOrderNumber(order.orderNumber);

      const userNotif = getUserNotificationForStatus("CANCELLED", {
        orderId: order.id,
        orderRef,
      });

      if (userNotif) {
        await notifyUserRealtime({
          userId: order.userId,
          ...userNotif,
          link: `/orders/${order.orderNumber}`,
        });
      }

      const adminNotif = getAdminNotificationForStatus("CANCELLED", {
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
  } catch (error) {
    console.error("POST /api/payments/paystack/cancel error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 },
    );
  }
}
