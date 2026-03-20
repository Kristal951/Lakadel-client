import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1).transform(val => val.trim()),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  category: z.string().min(1).transform(val => val.trim()),
  gender: z.string().min(1).transform(val => val.trim()),
  sku: z.string().min(1).transform(val => val.trim()),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string(),
  })).default([]),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).default("DRAFT"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const validation = productSchema.safeParse(raw);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? "",
        price: data.price,
        totalStock: data.stock,
        category: data.category,
        gender: data.gender,
        sku: data.sku,
        status: data.status,
        images: data.images,
        filters: data.tags,
        sizes: data.sizes,
        colors: data.colors,
      },
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );

  } catch (e: any) {
    console.error(e);

    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}