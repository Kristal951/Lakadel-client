import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.update({
      where: { id },
      data: {
        status: "ARCHIVED",
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Archive product error:", error);

    return NextResponse.json(
      { error: "Failed to archive product" },
      { status: 500 }
    );
  }
}