import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        total: true,
        currency: true,
        paymentRef: true,
        paidAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to fetch order" },
      { status: 500 },
    );
  }
}
