import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  TrendingUp,
  Package,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/DashboardWidgets";
import { StatCardTwo } from "@/components/admin/StatCardTwo";
import { formatOrderNumber } from "@/lib/cartDB";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const d = new Date(now);
  d.setDate(now.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

export default async function AdminDashboardPage() {
  const today = startOfToday();
  const week = startOfWeek();
  const month = startOfMonth();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    recentOrders,
    ordersToday,
    pendingOrders,
    paidOrders,
    deliveredOrders,
    failedOrders,
    cancelledOrders,
    customersCount,
    revenueTodayAgg,
    revenueWeekAgg,
    revenueMonthAgg,
    allOrdersCount,
    avgOrderAgg,
    revenueTrendRaw,
    statusCountsRaw,
    monthlyRevenueRaw,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: { select: { quantity: true } },
      },
    }),

    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),

    prisma.order.count({
      where: { status: "PENDING" },
    }),

    prisma.order.count({
      where: { status: "PAID" },
    }),

    prisma.order.count({
      where: { status: "DELIVERED" },
    }),

    prisma.order.count({
      where: { status: "FAILED" },
    }),

    prisma.order.count({
      where: { status: "CANCELLED" },
    }),

    prisma.user.count({
      where: { isGuest: false },
    }),

    prisma.order.aggregate({
      where: {
        paidAt: { gte: today },
      },
      _sum: { totalKobo: true },
    }),

    prisma.order.aggregate({
      where: {
        paidAt: { gte: week },
      },
      _sum: { totalKobo: true },
    }),

    prisma.order.aggregate({
      where: {
        paidAt: { gte: month },
      },
      _sum: { totalKobo: true },
    }),

    prisma.order.count(),

    prisma.order.aggregate({
      where: {
        paidAt: { not: null },
      },
      _avg: { totalKobo: true },
    }),

    prisma.order.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { paidAt: "asc" },
      select: {
        paidAt: true,
        totalKobo: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),

    prisma.order.findMany({
      where: {
        paidAt: { not: null },
      },
      select: {
        paidAt: true,
        totalKobo: true,
      },
      orderBy: {
        paidAt: "asc",
      },
    }),

    prisma.orderItem.findMany({
      select: {
        quantity: true,
        product: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            paidAt: true,
          },
        },
      },
    }),
  ]);

  const revenueToday = (revenueTodayAgg._sum.totalKobo ?? 0) / 100;
  const revenueWeek = (revenueWeekAgg._sum.totalKobo ?? 0) / 100;
  const revenueMonth = (revenueMonthAgg._sum.totalKobo ?? 0) / 100;
  const averageOrderValue = (avgOrderAgg._avg.totalKobo ?? 0) / 100;

  function localDateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));

    return {
      key: localDateKey(d),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: 0,
    };
  });

  for (const row of revenueTrendRaw) {
    if (!row.paidAt) continue;

    const key = localDateKey(new Date(row.paidAt));
    const found = last7Days.find((d) => d.key === key);

    if (found) {
      found.revenue += (row.totalKobo ?? 0) / 100;
    }
  }

  console.log(
    last7Days,
    revenueTrendRaw.map((row) => ({
      paidAt: row.paidAt,
      key: row.paidAt ? localDateKey(new Date(row.paidAt)) : null,
      totalKobo: row.totalKobo,
    })),
  );

  const statusMap: Record<string, number> = {
    PENDING: 0,
    PAID: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    FAILED: 0,
    CANCELLED: 0,
    REFUNDED: 0,
  };

  for (const row of statusCountsRaw) {
    statusMap[row.status] = row._count.status;
  }

  const statusChartData = Object.entries(statusMap).map(([status, value]) => ({
    status,
    value,
  }));

  const monthlyRevenueMap = new Map<string, number>();

  for (const row of monthlyRevenueRaw) {
    if (!row.paidAt) continue;

    const date = new Date(row.paidAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueMap.set(
      key,
      (monthlyRevenueMap.get(key) ?? 0) + (row.totalKobo ?? 0) / 100,
    );
  }

  const monthlyRevenueData = Array.from(monthlyRevenueMap.entries()).map(
    ([key, revenue]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);

      return {
        key,
        month: date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue,
      };
    },
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-foreground/70">
            Welcome back. Here is what is happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-xl hover:opacity-90 transition text-sm font-semibold"
          >
            Manage Orders
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCardTwo
          title="Revenue Today"
          value={formatMoney(revenueToday)}
          iconKey="card"
          trend="Paid today"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />
        <StatCardTwo
          title="Revenue This Week"
          value={formatMoney(revenueWeek)}
          iconKey="card"
          trend="Paid this week"
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />
        <StatCardTwo
          title="Revenue This Month"
          value={formatMoney(revenueMonth)}
          iconKey="card"
          trend="Paid this month"
          iconBg="bg-lime-100"
          iconColor="text-lime-700"
        />
        <StatCardTwo
          title="Orders Today"
          value={ordersToday.toString()}
          iconKey="shopBag"
          trend="Created today"
          iconBg="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      <DashboardCharts
        revenueTrend={last7Days}
        statusData={statusChartData}
        monthlyRevenueData={monthlyRevenueData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="rounded-3xl border border-foreground/10 bg-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Business Snapshot
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Total Orders</span>
              <span className="font-semibold text-foreground">
                {allOrdersCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Customers</span>
              <span className="font-semibold text-foreground">
                {customersCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Failed Orders</span>
              <span className="font-semibold text-foreground">
                {failedOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Cancelled Orders</span>
              <span className="font-semibold text-foreground">
                {cancelledOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Avg Order Value</span>
              <span className="font-semibold text-foreground">
                {formatMoney(averageOrderValue)}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Fulfilment
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Pending</span>
              <span className="font-semibold text-foreground">
                {pendingOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Paid</span>
              <span className="font-semibold text-foreground">
                {paidOrders}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Delivered</span>
              <span className="font-semibold text-foreground">
                {deliveredOrders}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-foreground/10 bg-background p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Customer Base
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Registered Customers</span>
              <span className="font-semibold text-foreground">
                {customersCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Recent Orders Shown</span>
              <span className="font-semibold text-foreground">
                {recentOrders.length}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-background rounded-3xl border border-foreground/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-foreground" />
            <h2 className="text-lg font-bold text-foreground">
              Recent Transactions
            </h2>
          </div>
          <button className="text-foreground/40 hover:text-foreground/70">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-foreground/3 text-left border-b border-foreground/10">
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Order Ref
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider text-center">
                  Qty
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-foreground/70 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-foreground/8">
              {recentOrders.map((o: any) => {
                const itemsCount = o.orderItems.reduce(
                  (sum: number, it: any) => sum + it.quantity,
                  0,
                );

                return (
                  <tr
                    key={o.id}
                    className="group hover:bg-foreground/2 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold truncate text-foreground bg-background border border-foreground/20 px-2 py-1 rounded-md uppercase">
                        #{formatOrderNumber(o.orderNumber)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {o.customerEmail ?? "—"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-foreground">
                      {itemsCount}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-foreground">
                        {Number((o.totalKobo ?? 0) / 100).toLocaleString(
                          undefined,
                          {
                            style: "currency",
                            currency: o.currency || "NGN",
                            maximumFractionDigits:
                              (o.currency || "NGN") === "NGN" ? 0 : 2,
                          },
                        )}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="p-12 text-center text-foreground/40 italic text-sm">
              No recent transactions found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
