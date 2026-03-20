import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "Receipt available only after payment." },
        { status: 400 },
      );
    }

    // --------- Build PDF ----------
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const marginX = 50;
    const pageWidth = 545;
    let y = 780;

    const money = (amt: number) => {
      const formatted = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: order.currency,
        maximumFractionDigits: order.currency === "NGN" ? 0 : 2,
      }).format(amt);

      // Replace the Naira symbol with a standard 'N' to prevent PDF encoding errors
      return formatted.replace("₦", "NGN");
    };

    // 1. Brand Header
    page.drawText("LAKADEL", {
      x: marginX,
      y,
      size: 24,
      font: bold,
      color: rgb(0.69, 0.05, 0.05),
    }); // Your brand red
    page.drawText("OFFICIAL RECEIPT", {
      x: 400,
      y: 785,
      size: 10,
      font: bold,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 40;

    // 2. Info Grid
    const drawInfo = (label: string, value: string, xOffset: number) => {
      page.drawText(label, {
        x: xOffset,
        y,
        size: 9,
        font: bold,
        color: rgb(0.5, 0.5, 0.5),
      });
      page.drawText(value, { x: xOffset, y: y - 14, size: 10, font });
    };

    drawInfo("ORDER ID", order.id.toUpperCase(), marginX);
    drawInfo(
      "DATE",
      order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "-",
      250,
    );
    drawInfo("CUSTOMER", order.customerEmail || "-", 400);

    y -= 50;
    page.drawLine({
      start: { x: marginX, y },
      end: { x: pageWidth, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });
    y -= 30;

    // 3. Items Table Header
    page.drawText("DESCRIPTION", { x: marginX, y, size: 10, font: bold });
    page.drawText("QTY", { x: 350, y, size: 10, font: bold });
    page.drawText("PRICE", { x: 400, y, size: 10, font: bold });
    page.drawText("TOTAL", { x: 480, y, size: 10, font: bold });
    y -= 15;

    // 4. List Items
    for (const it of order.orderItems) {
      y -= 20;
      page.drawText(it.product.name, { x: marginX, y, size: 10, font });
      page.drawText(`${it.quantity}`, { x: 350, y, size: 10, font });
      page.drawText(money(it.price), { x: 400, y, size: 10, font });
      page.drawText(money(it.quantity * it.price), {
        x: 480,
        y,
        size: 10,
        font,
      });

      if (y < 150) break; // Basic overflow protection
    }

    y -= 40;
    page.drawLine({
      start: { x: 350, y },
      end: { x: pageWidth, y },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.9),
    });
    y -= 25;

    // 5. Totals Section
    const drawTotalRow = (label: string, value: string, isBig = false) => {
      page.drawText(label, {
        x: 350,
        y,
        size: isBig ? 12 : 10,
        font: isBig ? bold : font,
      });
      page.drawText(value, {
        x: 480,
        y,
        size: isBig ? 12 : 10,
        font: isBig ? bold : font,
      });
      y -= 20;
    };

    drawTotalRow("Subtotal", money(order.subTotal ?? 0));
    drawTotalRow("Shipping", money(order.shippingFee ?? 0));
    y -= 5;
    drawTotalRow("TOTAL PAID", money(order.total), true);

    // 6. Footer
    y = 60;
    page.drawText("Thank you for your purchase!", {
      x: marginX,
      y,
      size: 10,
      font: bold,
    });
    page.drawText("This is an electronically generated receipt.", {
      x: marginX,
      y: y - 12,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    const body = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength,
    );

    return new NextResponse(
      new Blob([Buffer.from(pdfBytes)], { type: "application/pdf" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
        },
      },
    );
  } catch (e: any) {
    console.log(e);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 },
    );
  }
}
