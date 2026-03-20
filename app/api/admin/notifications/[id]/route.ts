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
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" };

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Notification id required" },
        { status: 400 },
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        id,
        userId: user.id,
        audience: "ADMIN",
        read: false,
      },
      data: {
        read: true,
      },
    });

    if (result.count === 0) {
      const existing = await prisma.notification.findFirst({
        where: {
          id,
          userId: user.id,
          audience: "ADMIN",
        },
        select: { id: true, read: true },
      });

      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        alreadyRead: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin mark read error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to mark admin notification as read" },
      { status: 500 },
    );
  }
}
