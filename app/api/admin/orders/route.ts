import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await prisma.order.findMany();
    return NextResponse.json(orders);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
