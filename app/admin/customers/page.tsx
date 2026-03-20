import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";
import { StatCard } from "@/components/admin/DashboardWidgets";
import { StatCardTwo } from "@/components/admin/StatCardTwo";

export default function AdminCustomersPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Customers
        </h1>
        <p className="text-sm text-foreground/50">
          Monitor customer behavior and lifetime value.
        </p>
      </header>

      {/* Customer Metrics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCardTwo
          title="Total Customers"
          value="8,432"
          iconKey="customers"
          trend="+10%"
          iconBg="bg-blue-100"
          iconColor="text-blue-700"
        />
        <StatCardTwo
          title="New This Month"
          value="412"
          iconKey="userAdd"
          trend="+24%"
          iconBg="bg-emerald-100"
          iconColor="text-emerald-700"
        />
        <StatCardTwo
          title="Active Now"
          value="89"
          iconKey="activeUsers"
          iconBg="bg-indigo-100"
          iconColor="text-indigo-700"
        />
        <StatCardTwo
          title="Avg. LTV"
          value="$542.50"
          iconKey="average"
          trend="+3.2%"
          iconBg="bg-purple-100"
          iconColor="text-purple-700"
        />
      </div>

      {/* Search & Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full rounded-2xl border border-foreground/10 bg-foreground/2 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-foreground/5 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-background px-5 py-3 text-sm font-semibold text-foreground/70 hover:bg-foreground/3 transition-all">
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Customers Table */}
      <div className="rounded-[2.5rem] border border-foreground/10 bg-background overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-foreground/5 bg-foreground/1">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                Customer
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                Status
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                Total Spent
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">
                Last Order
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <tr
                key={i}
                className="group hover:bg-foreground/1 transition-colors"
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    {/* User Avatar Placeholder */}
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-foreground/10 to-foreground/5 flex items-center justify-center text-xs font-bold text-foreground/40">
                      JD
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        Jane Doe
                      </span>
                      <span className="text-xs text-foreground/40">
                        jane.doe@example.com
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                    <span className="h-1 w-1 rounded-full bg-emerald-600" />
                    Repeat Buyer
                  </span>
                </td>
                <td className="px-8 py-6 text-sm font-mono font-bold text-foreground">
                  $1,240.00
                </td>
                <td className="px-8 py-6 text-sm text-foreground/60 italic">
                  2 days ago
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="h-8 w-8 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
