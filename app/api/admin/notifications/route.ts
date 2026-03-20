import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: "USER" | "ADMIN" };

  const userId = user?.id;
  const role = user?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? 50), 100);
  const cursor = searchParams.get("cursor");

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
        audience: "ADMIN",
      },
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
        action: true,
        link: true,
        read: true,
        status: true,
        priority: true,
        createdAt: true,
        orderId: true,
        meta: true,
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
    }),
    prisma.notification.count({
      where: {
        userId,
        audience: "ADMIN",
        read: false,
      },
    }),
  ]);

  return NextResponse.json({
    items: items.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
    nextCursor: items.length ? items[items.length - 1].id : null,
  });
}

export async function DELETE(_req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: "USER" | "ADMIN" };

  const userId = user?.id;
  const role = user?.role;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
        userId,
        audience: "ADMIN",
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete admin notifications" },
      { status: 500 },
    );
  }
}