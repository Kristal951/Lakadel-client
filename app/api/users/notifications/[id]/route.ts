import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Notification id required" },
        { status: 400 },
      );
    }

    const updated = await prisma.notification.updateMany({
      where: { id, userId, read: false },
      data: { read: true },
    });

    if (updated.count === 0) {
      const exists = await prisma.notification.findFirst({
        where: { id, userId },
      });
      if (!exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Mark read error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to mark as read" },
      { status: 500 },
    );
  }
}
