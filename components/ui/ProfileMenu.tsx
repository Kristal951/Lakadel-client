"use client";

import useUserStore from "@/store/userStore";
import { Heart, Shield, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import useCartStore from "@/store/cartStore";

interface ProfileMenuProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}

export default function ProfileMenu({ setOpen, open }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { logout, currency, currencySymbol, setLoggingOut } = useUserStore();
  const { data: session, status } = useSession();
  const user = session?.user as
    | (typeof session extends { user: infer U } ? U : any)
    | undefined;

  const isGuest = status === "authenticated" && !!user && user.isGuest === true;

  const isAuthedUser =
    status === "authenticated" && !!user && user.isGuest !== true;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  if (!open) return null;

  const handleLoginRedirect = () => {
    setOpen(false);
    router.push("/auth/login");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setOpen(false);
    try {
      useCartStore.getState().clearLocalCart();
      logout();
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      console.log(error);
    } finally {
      setLoggingOut(false);
    }
  };

  const guardLinkClick = (e: React.MouseEvent, href: string) => {
    if (!isAuthedUser) {
      e.preventDefault();
      handleLoginRedirect();
      return;
    }
    setOpen(false);
    router.push(href);
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 w-54 rounded-xl border border-foreground/20 bg-background shadow-lg py-2 z-50"
    >
      <div className="px-4 py-2 border-b border-foreground/10 mb-1">
        {isAuthedUser ? (
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-foreground truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-xs text-foreground/50 truncate">
              {currencySymbol} {currency}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
              {isGuest ? "Guest" : "Account"}
            </p>

            {isGuest && (
              <p className="text-[10px] text-foreground/50 leading-snug">
                You’re browsing as a guest. Sign in to save wishlist & settings.
              </p>
            )}

            <button
              onClick={handleLoginRedirect}
              className="w-full py-1.5 px-2 text-xs text-white bg-foreground rounded-md hover:bg-foreground/90 transition"
            >
              Login / Sign Up
            </button>
          </div>
        )}
      </div>

      <ul className="flex flex-col">
        <li>
          <span className="flex items-center px-4 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed">
            <Heart className="w-5 h-5 mr-2" />
            Wishlist (Coming soon)
          </span>
        </li>

        <li>
          <Link
            href="/orders"
            className={`flex items-center px-4 py-2.5 text-sm font-medium hover:bg-foreground/5 transition ${
              !isAuthedUser ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={(e) => guardLinkClick(e, "/orders")}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Orders
          </Link>
        </li>

        {user?.role === "ADMIN" && (
          <li>
            <Link
              href="/admin"
              className={`flex items-center px-4 py-2.5 text-sm font-medium hover:bg-foreground/5 transition ${
                !isAuthedUser ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={(e) => guardLinkClick(e, "/admin")}
            >
              <Shield className="w-5 h-5 mr-2" />
              Admin Dashboard
            </Link>
          </li>
        )}

        <li>
          {/* TODO: Enable when settings page is ready
  <span className="flex items-center px-4 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed">
    <FiSettings className="w-5 h-5 mr-2" />
    Settings (Coming soon)
  </span>
  */}
        </li>

        {isAuthedUser && (
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <FiLogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
