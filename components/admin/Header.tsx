"use client";

import { useMemo, useState } from "react";
import useUserStore from "@/store/userStore";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";
import AdminNotificationDropdown from "./AdminNotificationDropDown";

const PAGE_TITLES: Record<string, string> = {
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/settings": "Settings",
  "/admin/products/new": "New Product",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useUserStore();

  const [openAdminNotifications, setOpenAdminNotifications] = useState(false);

  const notifications = useAdminNotificationStore((s) => s.notifications);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const title = PAGE_TITLES[pathname] || "Admin Dashboard";

  return (
    <>
      <header className="fixed top-0 z-40 left-72 right-0 border-b border-foreground/5 bg-background">
        <div className="flex h-16 items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 rounded-xl border border-foreground/10 bg-foreground/5 pl-9 text-sm transition-all focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="flex items-center border-l border-foreground/10 ml-2 pl-4 gap-2">
              <button
                onClick={() => setOpenAdminNotifications(true)}
                className={`relative rounded-full p-2 transition-all ${
                  openAdminNotifications
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-500 animate-pulse" />
                )}
              </button>

              {user?.image ? (
                <div className="h-8 w-8 rounded-full ring-2 ring-foreground/5 overflow-hidden cursor-pointer hover:ring-primary/50 transition-all">
                  <Image
                    src={user.image}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover h-full w-full"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-foreground/10 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </header>

      {openAdminNotifications && (
        <AdminNotificationDropdown setOpen={setOpenAdminNotifications} />
      )}
    </>
  );
}
