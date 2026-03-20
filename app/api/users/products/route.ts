import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
