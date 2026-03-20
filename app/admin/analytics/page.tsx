"use client";

import { useMemo, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  CalendarDays,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { StatCardTwo } from "@/components/admin/StatCardTwo";

type Point = { date: string; revenue: number; profit: number };

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");

  // You can later swap this with API data based on `range`
  const rawData: Point[] = [
    { date: "Jan 1", revenue: 1200, profit: 400 },
    { date: "Jan 5", revenue: 2100, profit: 900 },
    { date: "Jan 10", revenue: 800, profit: 250 },
    { date: "Jan 15", revenue: 2600, profit: 1100 },
    { date: "Jan 20", revenue: 1900, profit: 720 },
    { date: "Jan 25", revenue: 3100, profit: 1400 },
    { date: "Jan 30", revenue: 2800, profit: 1200 },
  ];

  const totals = useMemo(() => {
    const revenue = rawData.reduce((s, d) => s + d.revenue, 0);
    const profit = rawData.reduce((s, d) => s + d.profit, 0);
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Placeholder counts (wire to DB later)
    const orders = 1284;
    const customers = 3421;

    return { revenue, profit, margin, orders, customers };
  }, [rawData]);

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-background p-8 space-y-10">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-sm text-foreground/50">
            Monitor store performance and financial metrics
          </p>
        </div>

        {/* DATE FILTER */}
        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-foreground/50" />
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-background border border-foreground/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-foreground"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last 1 year</option>
          </select>
        </div>
      </header>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCardTwo
          title="Revenue"
          value={`$${money(totals.revenue)}`}
          iconKey="revenue"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />

        <StatCardTwo
          title="Profit"
          value={`$${money(totals.profit)}`}
          iconKey="average"
          iconBg="bg-green-100"
          iconColor="text-green-700"
        />

        <StatCardTwo
          title="Orders"
          value={money(totals.orders)}
          iconKey="shopBag"
          iconBg="bg-purple-100"
          iconColor="text-purple-700"
        />

        <StatCardTwo
          title="Profit Margin"
          value={`${totals.margin.toFixed(1)}%`}
          iconKey="profit"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-700"
        />
      </section>

      <section className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-background border border-foreground/10 rounded-3xl p-6">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue vs Profit</h3>
              <p className="text-xs text-foreground/50">
                Based on selected timeframe ({range})
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rawData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="currentColor"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="currentColor"
                      stopOpacity={0.15}
                    />
                    <stop
                      offset="95%"
                      stopColor="currentColor"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />

                <Tooltip
                  formatter={(value: any, name: any) => [
                    `$${money(Number(value))}`,
                    name,
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="url(#revFill)"
                  fillOpacity={1}
                />

                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="url(#profFill)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background border border-foreground/10 rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-6">Order Breakdown</h3>

          <div className="space-y-4">
            <BreakdownRow label="Paid Orders" value="980" />
            <BreakdownRow label="Pending" value="210" />
            <BreakdownRow label="Failed" value="94" />
            <BreakdownRow label="Refunded" value="12" />
          </div>
        </div>
      </section>

      <section className="bg-background border border-foreground/10 rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Top Selling Products</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-foreground/50 border-b border-foreground/10">
              <tr>
                <th className="py-3">Product</th>
                <th>Sales</th>
                <th>Revenue</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-foreground/5">
              <TableRow
                name="Classic Hoodie"
                sales="412"
                revenue="$12,480"
                stock="34"
              />
              <TableRow
                name="Urban Sneakers"
                sales="305"
                revenue="$18,900"
                stock="12"
              />
              <TableRow
                name="Slim Fit Jeans"
                sales="288"
                revenue="$9,760"
                stock="56"
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-foreground/60">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function TableRow({
  name,
  sales,
  revenue,
  stock,
}: {
  name: string;
  sales: string;
  revenue: string;
  stock: string;
}) {
  return (
    <tr>
      <td className="py-4 font-medium">{name}</td>
      <td>{sales}</td>
      <td>{revenue}</td>
      <td>{stock}</td>
    </tr>
  );
}
