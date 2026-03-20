import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const orderId = body?.orderId as string | undefined;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        totalKobo: true,
        orderNumber: true,
        paymentMethod: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["PENDING", "FAILED"].includes(order.status)) {
      return NextResponse.json(
        { error: `You cannot retry payment for an order with status ${order.status}` },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Missing PAYSTACK_SECRET_KEY" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "Missing APP_URL or NEXT_PUBLIC_APP_URL" },
        { status: 500 }
      );
    }

    const reference = `pay_${order.id}_${Date.now()}`;

    const paystackRes = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        amount: order.totalKobo/100,
        reference,
        callback_url: `${appUrl}/orders/${order.orderNumber}`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          retry: true,
        },
      }),
    });

    const paystackData = await paystackRes.json().catch(() => null);

    if (!paystackRes.ok || !paystackData?.status) {
      return NextResponse.json(
        { error: paystackData?.message || "Failed to initialize retry payment" },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: "PAYSTACK",
        paymentRef: reference,
      },
    });

    return NextResponse.json({
      ok: true,
      authorization_url: paystackData.data?.authorization_url,
      access_code: paystackData.data?.access_code,
      reference,
    });
  } catch (error) {
    console.error("POST /api/users/paystack/retry error:", error);
    return NextResponse.json(
      { error: "Failed to retry payment" },
      { status: 500 }
    );
  }
}