import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { OrderStatus } from "@prisma/client";
import { formatOrderNumber } from "@/lib/cartDB";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import {
  notifyAdminsRealtime,
  notifyUserRealtime,
} from "@/lib/notifyUserRealtime";
import { getAdminNotificationForStatus } from "@/lib/getAdminNotificationsForStatus";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "FAILED", "CANCELLED"],
  PAID: ["SHIPPED", "REFUNDED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  FAILED: ["PAID", "CANCELLED"],
  REFUNDED: [],
  CANCELLED: [],
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user?.id || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const rawStatus = String(body?.status || "").toUpperCase();

    if (!Object.values(OrderStatus).includes(rawStatus as OrderStatus)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const nextStatus = rawStatus as OrderStatus;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        paidAt: true,
        orderNumber: true,
        customerEmail: true,
        total: true,
        guestId: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const allowed = allowedTransitions[order.status] ?? [];

    if (nextStatus !== order.status && !allowed.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid transition from ${order.status} to ${nextStatus}` },
        { status: 400 },
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(nextStatus === "PAID" && !order.paidAt
          ? { paidAt: new Date() }
          : {}),
      },
      select: {
        id: true,
        status: true,
        orderNumber: true,
      },
    });

    if (order.userId || order.guestId) {
      const orderRef = formatOrderNumber(order.orderNumber);

      const userNotif = getUserNotificationForStatus(nextStatus, {
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

      const adminNotif = getAdminNotificationForStatus(nextStatus, {
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

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 },
    );
  }
}
