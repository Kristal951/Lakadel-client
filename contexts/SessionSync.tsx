"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import useUserStore from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function SessionSync() {
  const { data: session, status } = useSession();
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);
  const setCurrency = useUserStore((s) => s.setCurrency);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      logout();
      return;
    }

    const userFromSession = {
      id: (session.user as any).id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
      currency: (session.user as any).currency ?? "NGN",
    };

    setUser(userFromSession as any);
    setCurrency(userFromSession.currency);
  }, [session, status, setUser, logout, setCurrency]);

  return null;
}
