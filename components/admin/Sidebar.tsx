"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChartLine,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: ChartLine },
  // { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className=" top-0 left-4 z-50 md:hidden fixed bg-white/80 backdrop-blur-md border border-slate-200 rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
        />
      )}

      <aside
        className={clsx(
          "fixed z-50 top-0 left-0 h-screen w-72 bg-background backdrop-blur-xl border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
                  <div className="relative h-10 w-20 shrink-0">
        <Image
          src="/Lakadel2.png"
          alt="Lakadel logo"
          fill
          priority
          className="object-contain"
        />
      </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Lakadel Admin
              </span>
              <span className="text-[10px] text-foreground/60 font-bold uppercase tracking-[0.15em]">
                V2.0 Pro
              </span>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-2 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="mb-4 px-2 text-[11px] font-semibold text-foreground/60 uppercase tracking-widest">
            Main Menu
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href 
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "group relative flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? " text-foreground bg-foreground/10"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={clsx("w-5 h-5", active ? "text-foreground" : "text-foreground/40 group-hover:text-foreground")} />
                  {item.name}
                </div>
                {active && (
                    <ChevronRight className="w-4 h-4 opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer/User Section */}
        {/* <div className="p-4 mt-auto">
          <div className="border border-foreground/50 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/10 border border-slate-600" />
                <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold text-foreground truncate">Admin User</span>
                    <span className="text-[10px] text-foreground/50 truncate">admin@lakadel.com</span>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/10"
            >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
            </button>
          </div>
        </div> */}
      </aside>
    </>
  );
}