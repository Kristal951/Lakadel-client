import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import Client from "./Client";
import { formatOrderNumber } from "@/lib/cartDB";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { status } = await searchParams;
  const rawStatus = status?.toUpperCase();

  const activeStatus = Object.values(OrderStatus).includes(
    rawStatus as OrderStatus
  )
    ? (rawStatus as OrderStatus)
    : undefined;

  const userId = session.user.id;

  const [rawOrders, totalOrders, totalSpentAgg, groupedStatusCounts] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
          ...(activeStatus ? { status: activeStatus } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          orderNumber: true,
          totalKobo: true,
          status: true,
          createdAt: true,
          orderItems: {
            take: 2,
            select: {
              id: true,
              quantity: true,
              selectedSize: true,
              selectedColor: true,
              unitPriceKobo: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
      }),

      prisma.order.count({
        where: { userId },
      }),

      prisma.order.aggregate({
        where: { userId },
        _sum: { totalKobo: true },
      }),

      prisma.order.groupBy({
        by: ["status"],
        where: { userId },
        _count: {
          status: true,
        },
      }),
    ]);

  const orders = rawOrders.map((order) => ({
    ...order,
    formattedOrderNumber: formatOrderNumber(order.orderNumber),
    itemCount: order._count.orderItems,
  }));

  const counts: Record<"all" | "PENDING" | "PAID" | "SHIPPED" | "DELIVERED", number> = {
    all: totalOrders,
    PENDING: 0,
    PAID: 0,
    SHIPPED: 0,
    DELIVERED: 0,
  };

  for (const row of groupedStatusCounts) {
    if (row.status in counts) {
      counts[row.status as "PENDING" | "PAID" | "SHIPPED" | "DELIVERED"] =
        row._count.status;
    }
  }

  const totalSpent = totalSpentAgg._sum.totalKobo ?? 0;

  return (
    <Client
      orders={orders}
      counts={counts}
      totalSpent={totalSpent}
      activeStatus={activeStatus}
    />
  );
}