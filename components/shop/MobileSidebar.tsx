"use client";
import useCartStore from "@/store/cartStore";
import useUserStore from "@/store/userStore";
import { Heart, LogOut, Shield, ShoppingBag, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CgProfile } from "react-icons/cg";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const MobileSidebar = ({ toggleSidebar, sidebarOpen }: SidebarProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { logout, setLoggingOut, currency } = useUserStore();

  const user = session?.user as
    | {
        isGuest?: boolean;
        role?: string;
        image?: string;
        name?: string;
        email?: string;
      }
    | undefined;

  const isAuthedUser =
    status === "authenticated" && !!user && user.isGuest !== true;
  const isActive = (path: string) => pathname === path;

  const handleLinkNavigation = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    toggleSidebar();
    if (!isAuthedUser && href !== "/shop") {
      router.push("/auth/login");
    } else {
      router.push(href);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    toggleSidebar();
    try {
      useCartStore.getState().clearLocalCart();
      logout();
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getLinkClassName = (path: string) => `
    flex items-center px-4 py-3 text-sm font-medium transition-all
    ${
      isActive(path)
        ? "text-foreground bg-foreground/10 border-r-4 border-foreground"
        : "text-foreground/70 hover:bg-foreground/5"
    }
    ${!isAuthedUser && path !== "/shop" ? "opacity-50 cursor-not-allowed" : ""}
  `;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
        />
      )}

      <div
        className={`
          fixed left-0 bottom-0 top-0 z-50 md:hidden flex flex-col
          bg-white transition-all duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? "w-[85%] opacity-100" : "w-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex-1 flex flex-col pt-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 px-4">
            <Link
              href="/shop"
              onClick={toggleSidebar}
              className="relative h-8 w-24 shrink-0"
            >
              <Image
                src="/Lakadel2.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-foreground/5 rounded-full text-foreground"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/orders"
              className={getLinkClassName("/orders")}
              onClick={(e) => handleLinkNavigation(e, "/orders")}
            >
              <ShoppingBag className="w-5 h-5 mr-3" /> Orders
            </Link>

            <div className="flex items-center px-4 py-3 text-sm font-medium text-foreground/40 cursor-not-allowed">
              <Heart className="w-5 h-5 mr-3" /> Wishlist
              <span className="ml-2 text-[10px] bg-foreground/5 px-1.5 py-0.5 rounded text-foreground/60 uppercase font-bold tracking-tighter">
                Soon
              </span>
            </div>

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={getLinkClassName("/admin")}
                onClick={(e) => handleLinkNavigation(e, "/admin")}
              >
                <Shield className="w-5 h-5 mr-3" /> Admin Panel
              </Link>
            )}
          </nav>
        </div>

        <div className="border-t border-foreground/10 p-5 bg-foreground/2">
          {!isAuthedUser ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground/5 rounded-full">
                  <CgProfile className="h-6 w-6 text-foreground/60" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                    Guest Account
                  </p>
                  <p className="text-[11px] text-foreground/60 leading-tight">
                    Sign in to sync your cart and orders
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  toggleSidebar();
                  router.push("/auth/login");
                }}
                className="w-full py-3 text-sm font-bold text-white bg-foreground rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
              >
                Login / Sign Up
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt="User"
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 bg-foreground rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="flex gap-1 items-center">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user?.name}
                    </p>
                    -
                    <p className="text-sm font-mono font-bold text-foreground opacity-80">
                      {currency}
                    </p>
                  </span>

                  <p className="text-xs text-foreground/60 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 text-foreground/40 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
