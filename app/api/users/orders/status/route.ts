import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paidAt: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json(order);
}
