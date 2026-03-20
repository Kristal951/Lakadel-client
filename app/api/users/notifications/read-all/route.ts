import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true, updated: res.count });
  } catch (e: any) {
    console.error("Mark all read error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to mark all as read" },
      { status: 500 },
    );
  }
}