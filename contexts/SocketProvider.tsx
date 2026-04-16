"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useUserNotificationStore } from "@/store/userNotificationsStore";
import { AppNotification } from "@/store/types";
import { useAdminNotificationStore } from "@/store/adminNotificationStore";

export default function SocketNotificationsClient() {
  const pushUser = useUserNotificationStore((s) => s.push);
  const pushAdmin = useAdminNotificationStore((s) => s.push);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let socket: Socket;

    const init = async () => {
      const res = await fetch("/api/users/me");
      const { userId, guestId, role } = await res.json();

      if (!userId && !guestId) return;

      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        transports: ["websocket"],
      });

      const handleUserNotification = (n: AppNotification) => {
        if (n.audience && n.audience !== "USER") return;
        pushUser(n);
      };

      const handleAdminNotification = (n: AppNotification) => {
        if (n.audience && n.audience !== "ADMIN") return;
        pushAdmin(n);
      };

      socket.on("connect", () => {
        socket.emit("join", {
          userId,
          guestId,
          role,
        });
      });

      socket.on("notification:new", handleUserNotification);

      if (role === "ADMIN") {
        socket.on("admin:notification:new", handleAdminNotification);
      }

      socketRef.current = socket;
    };

    init();

    return () => {
      if (!socketRef.current) return;

      socketRef.current.off("notification:new");
      socketRef.current.off("admin:notification:new");
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [pushUser, pushAdmin]);

  return null;
}