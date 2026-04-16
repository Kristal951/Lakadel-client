import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderPdfDocument } from "@/lib/orderPdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: { include: { product: true } } },
    });
    if (!order || order.status !== "PAID") {
      return NextResponse.json(
        { message: "Receipt unavailable" },
        { status: 400 },
      );
    }
    console.log(order, "order");

    const shippingAddress =
      typeof order.shippingAddress === "string"
        ? JSON.parse(order.shippingAddress)
        : order.shippingAddress;

    const pdfOrder = {
      id: order.id,
      currency: order.currency,
      orderNumber: Number(order.orderNumber),
      createdAt: order.createdAt,
      status: String(order.status),
      paymentRef: order.paymentRef,
      customerName: order.customerName ?? "Guest",
      shippingAddress,
      shippingFee: order.shippingFee,
      subTotal: order.subTotal,
      total: order.totalKobo,
      customerEmail: order.customerEmail,
      paymentMethod: order.paymentMethod ?? "Standard",
      items: order.orderItems.map((item) => ({
        name: String(item.product.name),
        quantity: Number(item.quantity),
        lineTotalKobo: Number(item.lineTotalKobo),
        selectedSize: String(item.selectedSize),
        image: String(item.product.images?.[0] || null),
      })),
    };

    const pdfStream = await renderToStream(
      OrderPdfDocument({ type: "RECEIPT", order: pdfOrder }),
    );

    return new NextResponse(pdfStream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.orderNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Receipt PDF Error:", error);
    return NextResponse.json(
      { message: "Failed to generate receipt" },
      { status: 500 },
    );
  }
}
