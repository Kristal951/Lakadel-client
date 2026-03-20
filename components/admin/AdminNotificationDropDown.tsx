"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Check,
  ShoppingBag,
  Info,
  Trash2,
  BellOff,
  X,
  CreditCard,
  BellDot,
  AlertTriangle,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { AppNotification } from "@/store/types";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import Spinner from "../ui/spinner";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";

type Tab = "ALL" | "UNREAD" | "ORDERS" | "PAYMENTS" | "ALERTS" | "INFO";

interface NotificationDropdownProps {
  setOpen: (open: boolean) => void;
}

export default function AdminNotificationDropdown({
  setOpen,
}: NotificationDropdownProps) {
  const {
    notifications,
    markRead,
    markAllRead,
    clearAllNotification,
    loading,
  } = useAdminNotificationStore();

  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("ALL");

  const unreadCount = useMemo(
    () => notifications.filter((n: AppNotification) => !n.read).length,
    [notifications],
  );

  const filtered = useMemo(() => {
    const list = notifications as AppNotification[];

    if (tab === "ALL") return list;
    if (tab === "UNREAD") return list.filter((n) => n.read === false);
    if (tab === "ORDERS") return list.filter((n) => n.type === "ORDER");
    if (tab === "PAYMENTS") return list.filter((n) => n.type === "PAYMENT");
    if (tab === "INFO") return list.filter((n) => n.type === "INFO");

    if (tab === "ALERTS") {
      return list.filter(
        (n) =>
          n.priority === "URGENT" ||
          n.priority === "HIGH" ||
          n.action?.toUpperCase().includes("FAILED") ||
          n.action?.toUpperCase().includes("REFUND") ||
          n.action?.toUpperCase().includes("ALERT") ||
          n.action?.toUpperCase().includes("WEBHOOK"),
      );
    }

    return list;
  }, [notifications, tab]);

  const onClose = () => setOpen(false);

  const handleClear = async () => {
    try {
      await clearAllNotification();
      showToast("Admin notifications cleared", "success");
    } catch {
      showToast("Failed to clear admin notifications", "error");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-100 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        <motion.aside
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="relative ml-auto h-full w-full sm:w-105 bg-background border-l border-foreground/10 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-foreground/10">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h1 className="text-lg font-semibold">Admin Notifications</h1>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/10">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-foreground/5 transition"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
              <TabButton
                active={tab === "ALL"}
                onClick={() => setTab("ALL")}
                icon={<Bell className="w-4 h-4" />}
                label="All"
              />
              <TabButton
                active={tab === "UNREAD"}
                onClick={() => setTab("UNREAD")}
                icon={<BellDot className="w-4 h-4" />}
                label="Unread"
              />
              <TabButton
                active={tab === "ORDERS"}
                onClick={() => setTab("ORDERS")}
                icon={<ShoppingBag className="w-4 h-4" />}
                label="Orders"
              />
              <TabButton
                active={tab === "PAYMENTS"}
                onClick={() => setTab("PAYMENTS")}
                icon={<CreditCard className="w-4 h-4" />}
                label="Payments"
              />
              <TabButton
                active={tab === "ALERTS"}
                onClick={() => setTab("ALERTS")}
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Alerts"
              />
              <TabButton
                active={tab === "INFO"}
                onClick={() => setTab("INFO")}
                icon={<Info className="w-4 h-4" />}
                label="Info"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
                  <BellOff className="w-6 h-6 text-foreground/60" />
                </div>
                <p className="font-semibold">No notifications</p>
                <p className="text-sm text-foreground/60 mt-1">
                  You’ll see updates about orders, payments and store alerts
                  here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/5">
                <AnimatePresence initial={false}>
                  {filtered.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={() => {
                        if (!n.read) markRead(n.id);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-foreground/10">
            <div className="flex gap-3">
              <button
                onClick={markAllRead}
                disabled={notifications.every((n: AppNotification) => n.read)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-foreground text-background font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Mark all
              </button>

              <button
                disabled={loading}
                onClick={handleClear}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl border border-foreground/15 text-foreground hover:bg-foreground/5 transition"
              >
                {loading ? (
                  <Spinner w="5" h="5" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <p>Clear All</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold transition ${
        active
          ? "bg-foreground text-background"
          : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

const NotificationItem = ({
  notification,
  onRead,
}: {
  notification: any;
  onRead: () => void;
}) => {
  const type = String(notification.type || "").toUpperCase();
  const isOrder = type === "ORDER";
  const isPayment = type === "PAYMENT";
  const isPromo = type === "PROMOTION";

  const Icon = isOrder
    ? ShoppingBag
    : isPayment
      ? CreditCard
      : isPromo
        ? Tag
        : Info;

  const badgeClass = isOrder
    ? "bg-purple-100 text-purple-600"
    : isPayment
      ? "bg-emerald-100 text-emerald-600"
      : isPromo
        ? "bg-rose-100 text-rose-600"
        : "bg-blue-100 text-blue-600";

  const orderThumbs: string[] =
    notification?.order?.orderItems
      ?.map((it: any) => it?.product?.images?.[0])
      .filter(Boolean)
      .slice(0, 3) ?? [];

  return (
    <Link href={notification.link || "#"} onClick={onRead}>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`group relative p-4 flex gap-4 cursor-pointer transition-all ${
          !notification.read ? "bg-foreground/5" : "hover:bg-foreground/3"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center ${badgeClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          {orderThumbs.length > 0 && (
            <div className="mt-0.5 flex -space-x-2">
              {orderThumbs.map((src, idx) => (
                <div
                  key={src + idx}
                  className="relative w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-background bg-foreground/5"
                >
                  <Image
                    src={src}
                    alt="Order item"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-[13px] leading-snug truncate ${
                !notification.read
                  ? "font-bold text-foreground"
                  : "font-medium text-foreground/80"
              }`}
            >
              {notification.title}
            </p>

            {!notification.read && (
              <span className="mt-1.5 w-2 h-2 bg-foreground rounded-full ring-4 ring-foreground/10 shrink-0" />
            )}
          </div>

          <p className="text-xs text-foreground/60 mt-1 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          <p className="text-[10px] font-medium text-foreground/45 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};
