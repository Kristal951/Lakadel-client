import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumberParam = searchParams.get("orderNumber");

  if (!orderNumberParam) {
    return NextResponse.json({ error: "orderNumber required" }, { status: 400 });
  }

  const orderNumber = Number(orderNumberParam);

  if (!Number.isInteger(orderNumber)) {
    return NextResponse.json(
      { error: "orderNumber must be an integer" },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}