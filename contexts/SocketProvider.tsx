"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useUserNotificationStore } from "@/store/userNotificationsStore";
import { AppNotification } from "@/store/types";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";

export default function SocketNotificationsClient() {
  const { data: session, status } = useSession();
  const pushUser = useUserNotificationStore((s) => s.push);
  const pushAdmin = useAdminNotificationStore((s) => s.push);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const user = session?.user as {
      id?: string;
      role?: "USER" | "ADMIN";
    };

    const userId = user?.id;
    const role = user?.role ?? "USER";

    if (!userId) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ["websocket"],
    });

    const handleUserNotification = (n: AppNotification) => {
      console.log("📩 user realtime notification:", n);
      pushUser(n);
    };

    const handleAdminNotification = (n: AppNotification) => {
      console.log("🛡️ admin realtime notification:", n);
      pushAdmin(n);
    };

    const onUserNotification = (n: AppNotification) => {
      if (n.audience && n.audience !== "USER") return;
      handleUserNotification(n);
    };

    const onAdminNotification = (n: AppNotification) => {
      if (n.audience && n.audience !== "ADMIN") return;
      handleAdminNotification(n);
    };

    socket.on("connect", () => {
      socket.emit("join", { userId, role });
    });

    socket.on("notification:new", onUserNotification);

    if (role === "ADMIN") {
      socket.on("admin:notification:new", onAdminNotification);
    }

    socketRef.current = socket;

    return () => {
      socket.off("notification:new", onUserNotification);

      if (role === "ADMIN") {
        socket.off("admin:notification:new", onAdminNotification);
      }

      socket.disconnect();
      socketRef.current = null;
    };
  }, [status, session, pushUser, pushAdmin]);

  return null;
}