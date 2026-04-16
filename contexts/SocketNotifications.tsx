"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserNotificationStore } from "@/store/userNotificationsStore";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";

export function UserNotificationsBootstrap() {
  const { status } = useSession();

  const fetchUserNotifications = useUserNotificationStore(
    (s) => s.fetchNotifications,
  );

  useEffect(() => {
    if (status === "loading") return;
    fetchUserNotifications();
  }, [status, fetchUserNotifications]);

  return null;
}

export function AdminNotificationsBootstrap() {
  const { data: session, status } = useSession();

  const fetchAdminNotifications = useAdminNotificationStore(
    (s) => s.fetchNotifications,
  );

  useEffect(() => {
    if (status !== "authenticated") return;

    const user = session?.user as {
      id?: string;
      role?: "USER" | "ADMIN";
    };

    if (!user?.id) return;

    if (user.role === "ADMIN") {
      fetchAdminNotifications();
    }
  }, [status, session, fetchAdminNotifications]);

  return null;
}
