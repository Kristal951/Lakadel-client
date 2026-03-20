import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        totalStock: Number(body.totalStock ?? 0),
        category: body.category,
        gender: body.gender,
        sku: body.sku,
        status: body.status,
        filters: body.filters ?? [],
        sizes: body.sizes ?? [],
        colors: body.colors ?? [],
        images: body.images ?? [],
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("Edit product error:", error);

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}
