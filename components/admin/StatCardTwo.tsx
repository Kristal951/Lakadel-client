"use client";

import {
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  ShoppingBag,
  Users,
  CreditCard,
  UserPlus,
  UserCheck,
  TrendingUp,
  Percent
} from "lucide-react";

const ICONS = {
  revenue: DollarSign,
  active: Package,
  pending: Clock,
  paid: CheckCircle,
  card: CreditCard,
  shopBag: ShoppingBag,
  customers: Users,
  userAdd: UserPlus,
  activeUsers: UserCheck,
  average: TrendingUp,
  profit: Percent
} as const;

type IconKey = keyof typeof ICONS;

type StatCardTwoProps = {
  title: string;
  value: string;
  iconKey?: IconKey; // ✅ supports iconKey
  icon?: IconKey; // ✅ supports icon
  trend?: string | number;
  iconBg?: string;
  iconColor?: string;
};

export function StatCardTwo({
  title,
  value,
  iconKey,
  icon,
  trend,
  iconBg = "bg-foreground/5",
  iconColor = "text-foreground/70",
}: StatCardTwoProps) {
  const key = (iconKey ?? icon ?? "revenue") as IconKey;
  const Icon = ICONS[key];

  return (
    <div className="bg-background border border-foreground/10 rounded-3xl p-6 flex-col items-start justify-between gap-4">
      {/* <div className="w-full flex items-center justify-end mb-2">
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full border border-foreground/10 bg-foreground/5 text-foreground/70">
            {typeof trend === "number"
              ? `${trend >= 0 ? "+" : ""}${trend}%`
              : trend}
          </span>
        )}
      </div> */}
      <div className="min-w-0 flex  justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-foreground/50">{title}</p>
          </div>

          <h3 className="text-2xl font-bold mt-1 truncate">{value}</h3>
        </div>

        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
