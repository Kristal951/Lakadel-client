import clsx from "clsx";
import type { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: number | string;
}

export function StatCard({
  title,
  value,
  Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  trend,
}: StatCardProps) {
  const isNumber = typeof trend === "number";
  const isPositive = isNumber && trend >= 0;

  const trendText = isNumber ? `${isPositive ? "+" : ""}${trend}%` : trend;

  return (
    <div className="group bg-card border border-foreground/50 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {trend && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
              isNumber
                ? isPositive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                : "bg-muted text-muted-foreground border-transparent"
            }`}
          >
            {trendText}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm  text-foreground/70 tracking-tight">
          {title}
        </p>
        <h3 className="text-3xl font-bold tracking-tighter text-foreground">
          {value}
        </h3>
      </div>
    </div>
  );
}

type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "FAILED";

const STATUS_STYLES: Record<
  OrderStatus,
  { pill: string; dot: string; label: string }
> = {
  PENDING: {
    pill: "bg-amber-500/10 text-amber-800 border-amber-500/15",
    dot: "bg-amber-500",
    label: "Pending",
  },
  PAID: {
    pill: "bg-emerald-500/10 text-emerald-700 border-emerald-500/15",
    dot: "bg-emerald-500",
    label: "Paid",
  },
  SHIPPED: {
    pill: "bg-blue-500/10 text-blue-700 border-blue-500/15",
    dot: "bg-blue-500",
    label: "Shipped",
  },
  DELIVERED: {
    pill: "bg-indigo-500/10 text-indigo-700 border-indigo-500/15",
    dot: "bg-indigo-500",
    label: "Delivered",
  },
  CANCELLED: {
    pill: "bg-rose-500/10 text-rose-700 border-rose-500/15",
    dot: "bg-rose-500",
    label: "Cancelled",
  },
  FAILED: {
    pill: "bg-red-500/10 text-red-700 border-red-500/15",
    dot: "bg-red-500",
    label: "FAILED",
  },
};

export function StatusBadge({
  status,
  soft = true,
}: {
  status: string;
  soft?: boolean;
}) {
  const key = status?.toUpperCase() as OrderStatus;
  const s = STATUS_STYLES[key];

  const fallback = {
    pill: "bg-slate-500/10 text-slate-700 border-slate-500/15",
    dot: "bg-slate-500",
    label: status,
  };

  const final = s ?? fallback;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide",
        soft
          ? final.pill
          : "bg-foreground text-background border-foreground/30",
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={clsx(
            "absolute inline-flex h-full w-full rounded-full opacity-40",
            key === "PENDING" ? "animate-ping" : "animate-pulse",
            soft ? final.dot : "bg-background",
          )}
        />
        <span
          className={clsx(
            "relative inline-flex h-2 w-2 rounded-full",
            soft ? final.dot : "bg-background",
          )}
        />
      </span>

      <span className="leading-none">{final.label}</span>
    </span>
  );
}
