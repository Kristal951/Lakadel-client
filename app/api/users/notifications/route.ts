import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getGuestId } from "@/lib/guest";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    let guestId: string | null = null;

    if (!userId) {
      guestId = await getGuestId();
    }

    if (!userId && !guestId) {
      return NextResponse.json({
        items: [],
        unreadCount: 0,
        nextCursor: null,
      });
    }

    const where = userId ? { userId } : { guestId };

    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get("take") ?? 50), 100);
    const cursor = searchParams.get("cursor");

    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        link: true,
        read: true,
        createdAt: true,
        orderId: true,
        order: {
          select: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        read: false,
      },
    });

    return NextResponse.json({
      items: items.map((n: any) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      nextCursor: items.length ? items[items.length - 1].id : null,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    let guestId: string | null = null;

    if (!userId) {
      guestId = await getGuestId();
    }

    if (!userId && !guestId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = userId ? { userId } : { guestId };

    const deleted = await prisma.notification.deleteMany({
      where,
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error("DELETE notifications error:", error);

    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}