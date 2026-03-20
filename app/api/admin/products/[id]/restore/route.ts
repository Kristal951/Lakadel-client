import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.product.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product restored successfully",
    });
  } catch (error) {
    console.error("Restore product error:", error);

    return NextResponse.json(
      { error: "Failed to restore product" },
      { status: 500 },
    );
  }
}
