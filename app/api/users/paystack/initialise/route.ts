import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystackInitialize } from "@/lib/paystack";
import { notifyUserRealtime } from "@/lib/notifyUserRealtime";
import { getUserNotificationForStatus } from "@/lib/getUserNotificationsForStatus";
import { Body } from "@/store/types";
import { formatOrderNumber } from "@/lib/cartDB";

export const runtime = "nodejs";

function getBaseUrl() {
  const base =
    process.env.APP_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL;

  if (!base) return null;
  if (base.startsWith("http://") || base.startsWith("https://")) return base;
  return `https://${base}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const userId = body?.userId ?? null;
    const guestId = body?.guestId ?? null;

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing APP_URL / NEXTAUTH_URL / VERCEL_URL" },
        { status: 500 },
      );
    }

    const callbackUrl =
      baseUrl.replace(/\/$/, "") +
      `/checkout/success?provider=paystack&orderId=${encodeURIComponent(orderId)}`;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        customerEmail: true,
        totalKobo: true,
        userId: true,
        guestId: true,
        paymentRef: true,
        orderNumber: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["PENDING", "FAILED"].includes(order.status)) {
      return NextResponse.json(
        {
          error: `Cannot initialize payment for order with status ${order.status}`,
        },
        { status: 409 },
      );
    }

    if (userId && order.userId && order.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!userId && guestId && order.guestId && order.guestId !== guestId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const firstTimeInit = !order.paymentRef;

    const init = await paystackInitialize({
      email: order.customerEmail,
      amountKobo: order.totalKobo,
      callback_url: callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        app: "Lakadel",
        retry: !firstTimeInit,
      },
    });

    const reference = init?.data?.reference as string | undefined;
    const authorization_url = init?.data?.authorization_url as
      | string
      | undefined;

    if (!reference || !authorization_url) {
      throw new Error("Paystack initialize did not return reference/url");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING",
        paymentRef: reference,
        paymentMethod: "PAYSTACK",
      },
    });

    const shouldNotifyPending =
      order.userId &&
      order.orderNumber &&
      (firstTimeInit || (!firstTimeInit && order.status === "PENDING"));

    if (shouldNotifyPending) {
      const orderRef = formatOrderNumber(order.orderNumber);

      const userNotif = getUserNotificationForStatus("PENDING", {
        orderId: order.id,
        orderRef,
      });

      if (notif) {
        await notifyUserRealtime({
          userId: order.userId!,
          ...notif,
          orderId: order.id,
          link: `/orders/${order.orderNumber}`,
        });
      }
    }

    return NextResponse.json({ authorization_url, reference });
  } catch (e: any) {
    console.error("Paystack init error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to initialize Paystack" },
      { status: 500 },
    );
  }
}
