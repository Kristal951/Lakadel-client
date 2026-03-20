import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: "USER" | "ADMIN" };

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        audience: "ADMIN",
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error: any) {
    console.error("Admin mark all read error:", error);

    return NextResponse.json(
      {
        error:
          error?.message || "Failed to mark all admin notifications as read",
      },
      { status: 500 },
    );
  }
}
