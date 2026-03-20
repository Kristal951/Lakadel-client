import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

import { StatCard, StatusBadge } from "@/components/admin/DashboardWidgets";
import { Search } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";
import { StatCardTwo } from "@/components/admin/StatCardTwo";
import { formatOrderNumber } from "@/lib/cartDB";

type SearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 20;
const ALL_STATUSES = Object.values(OrderStatus);

function parsePage(page?: string) {
  const n = Number(page);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function formatSmartDate(date: string | Date) {
  const d = new Date(date);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const time = d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;

  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) + ` at ${time}`;
}

function normalizeQuery(q?: string) {
  const s = (q ?? "").trim();
  return s.length ? s.slice(0, 80) : undefined;
}

function normalizeStatus(status?: string): OrderStatus | undefined {
  if (!status) return undefined;
  const s = status.toUpperCase();
  return ALL_STATUSES.includes(s as OrderStatus)
    ? (s as OrderStatus)
    : undefined;
}

function formatMoney(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return user;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const page = parsePage(sp.page);
  const status = normalizeStatus(sp.status);
  const q = normalizeQuery(sp.q);
  const where: {
    status?: OrderStatus;
    OR?: any[];
  } = {};

  if (status) where.status = status;

  if (q) {
    const digitsOnly = q.replace(/\D/g, "");
    const numericQ = digitsOnly ? Number(digitsOnly) : NaN;
    const hasNumericQ = Number.isFinite(numericQ);

    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { paymentRef: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerEmail: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      ...(hasNumericQ ? [{ orderNumber: numericQ }] : []),
      {
        user: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, orders, revenueAgg, activeCount, pendingCount, paidCount] =
    await Promise.all([
      prisma.order.count({ where }),

      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
          paymentRef: true,
          customerName: true,
          customerEmail: true,
          orderNumber: true,
        },
      }),

      prisma.order.aggregate({
        where: { status: OrderStatus.PAID },
        _sum: { total: true },
      }),

      prisma.order.count({
        where: { status: { in: [OrderStatus.PENDING, OrderStatus.PAID] } },
      }),

      prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),

      prisma.order.count({
        where: { status: OrderStatus.PAID },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  if (safePage !== page) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(safePage));
    redirect(`/admin/orders?${params.toString()}`);
  }

  const totalRevenue = revenueAgg._sum.total ?? 0;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (status) baseParams.set("status", status);

  const hrefPage = (p: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  };

  const exportHref = (() => {
    const params = new URLSearchParams(baseParams);
    return `/api/admin/orders/export?${params.toString()}`;
  })();

  return (
    <div className="min-h-screen bg-background p-8 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="text-sm text-foreground/50">
            Manage and track customer transactions
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href={exportHref}
            className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95"
          >
            Export CSV
          </a>
        </div>
      </header>

      <div className="rounded-4xl border border-foreground/10 bg-background p-4 md:p-6">
        <form className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by order ID, ref, customer, email, phone…"
              className="w-full rounded-2xl border border-foreground/10 bg-background px-11 py-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>

          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-foreground/10"
          >
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button className="rounded-2xl bg-foreground px-5 py-3 text-sm font-bold text-background hover:bg-foreground/90">
            Apply
          </button>

          {(q || status) && (
            <Link
              href="/admin/orders"
              className="rounded-2xl border border-foreground/10 px-5 py-3 text-sm font-bold text-foreground/70 hover:bg-foreground/2"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCardTwo
          title="Total Revenue"
          value={formatMoney(Number(totalRevenue), "NGN")}
          iconKey="revenue"
          iconColor="text-emerald-700"
          iconBg="bg-emerald-100"
        />
        <StatCardTwo
          title="Active Orders"
          value={String(activeCount)}
          iconKey="active"
          iconColor="text-indigo-700"
          iconBg="bg-indigo-100"
        />
        <StatCardTwo
          title="Pending"
          value={String(pendingCount)}
          iconKey="pending"
          iconColor="text-amber-700"
          iconBg="bg-amber-100"
        />
        <StatCardTwo
          title="Paid"
          value={String(paidCount)}
          iconKey="paid"
          iconColor="text-green-700"
          iconBg="bg-green-100"
        />
      </div>

      {/* Table */}
      <div className="rounded-4xl border border-foreground/10 bg-background overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-foreground/5 bg-foreground/2">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
            {totalCount.toLocaleString()} order(s)
          </p>
          <p className="text-xs font-semibold text-foreground/40">
            Page {safePage} of {totalPages}
          </p>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-foreground/5 bg-foreground/2">
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                Order
              </th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                Customer
              </th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                Status
              </th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                Date
              </th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground/40">
                Amount
              </th>
              <th className="px-8 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-foreground/5">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-8 py-10 text-sm flex items-center justify-center w-full text-foreground"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="group hover:bg-foreground/1 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        #{formatOrderNumber(o.orderNumber)}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {o.customerName ?? "Customer"}
                      </span>
                      <span className="text-xs text-foreground/40">
                        {o.customerEmail}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="px-8 py-6 text-sm text-foreground/70">
                    {formatSmartDate(o.createdAt)}
                  </td>

                  <td className="px-8 py-6 text-sm font-mono font-medium text-foreground">
                    {formatMoney(o.total, o.currency)}
                  </td>

                  <td className="px-8 py-6 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs font-bold text-foreground/40 hover:underline hover:text-foreground transition-colors"
                    >
                      DETAILS
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-foreground/5">
          <Link
            href={hrefPage(Math.max(1, safePage - 1))}
            aria-disabled={safePage <= 1}
            className={`rounded-2xl px-4 py-2 text-sm font-bold border border-foreground/10 ${
              safePage <= 1
                ? "pointer-events-none opacity-40"
                : "hover:bg-foreground/2"
            }`}
          >
            Prev
          </Link>

          <div className="text-xs font-semibold text-foreground/50">
            Showing{" "}
            <span className="font-bold text-foreground/70">{skip + 1}</span> –{" "}
            <span className="font-bold text-foreground/70">
              {Math.min(skip + PAGE_SIZE, totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-foreground/70">
              {totalCount.toLocaleString()}
            </span>
          </div>

          <Link
            href={hrefPage(Math.min(totalPages, safePage + 1))}
            aria-disabled={safePage >= totalPages}
            className={`rounded-2xl px-4 py-2 text-sm font-bold border border-foreground/10 ${
              safePage >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-foreground/2"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
