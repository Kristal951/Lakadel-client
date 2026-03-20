"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type RevenuePoint = {
  key: string;
  label: string;
  revenue: number;
};

type StatusPoint = {
  status: string;
  value: number;
};

type MonthlyRevenuePoint = {
  month: string;
  revenue: number;
};

type DashboardChartsProps = {
  revenueTrend: RevenuePoint[];
  statusData: StatusPoint[];
  monthlyRevenueData: MonthlyRevenuePoint[];
};

const moneyFormatter = (value: number | string | undefined) =>
  `₦${Number(value ?? 0).toLocaleString()}`;

export function DashboardCharts({
  revenueTrend,
  statusData,
  monthlyRevenueData,
}: DashboardChartsProps) {
  const totalRevenue7Days = revenueTrend.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalMonthlyRevenue = monthlyRevenueData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalOrders = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-foreground">
                Revenue Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Paid revenue across the last 7 days
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-background/80 px-4 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                Total
              </p>
              <p className="text-sm lg:text-base font-black text-foreground">
                ₦{totalRevenue7Days.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-80 rounded-3xl bg-muted/20 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    moneyFormatter(value)
                  }
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(120,120,120,0.15)",
                    background: "var(--background)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  stroke="#b10e0e" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-5 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm p-6 lg:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-foreground">
                Monthly Revenue
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Revenue performance by month
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-background/80 px-4 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                Total
              </p>
              <p className="text-sm lg:text-base font-black text-foreground">
                ₦{totalMonthlyRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-80 rounded-3xl bg-muted/20 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenueData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `₦${Number(value).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    moneyFormatter(value)
                  }
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(120,120,120,0.15)",
                    background: "var(--background)",
                  }}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#b10e0e"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="xl:col-span-12 rounded-4xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-foreground">
                Order Status Distribution
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of current order states
              </p>
            </div>

            <div className="rounded-2xl bg-background/80 px-4 py-2 text-right w-fit">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
                Total Orders
              </p>
              <p className="text-sm lg:text-base font-black text-foreground">
                {totalOrders.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-85 rounded-3xl bg-muted/20  p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number | string | undefined) =>
                    Number(value ?? 0).toLocaleString()
                  }
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(120,120,120,0.15)",
                    background: "var(--background)",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#b10e0e"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}