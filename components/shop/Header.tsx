"use client";

import useProductStore from "@/store/productStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { IoBagOutline, IoSearchOutline } from "react-icons/io5";
import ProfileMenu from "../ui/ProfileMenu";
import useCartStore from "@/store/cartStore";
import { useSession } from "next-auth/react";
import Spinner from "../ui/spinner";
import { Bell, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useUserNotificationStore } from "@/store/userNotificationsStore";
import UserNotificationDropdown from "./UserNotificationsDropDown";
import MobileSidebar from "./MobileSidebar";

const Header = () => {
  const router = useRouter();

  const { items, isSyncing } = useCartStore();
  const { query, setQuery } = useProductStore();
  const { unreadCount } = useUserNotificationStore();

  const { data: session } = useSession();
  const user = session?.user as any;

  const [localQuery, setLocalQuery] = useState(query);
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToBag = () => router.push("/shopping-bag");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(localQuery), 300);
    return () => clearTimeout(timer);
  }, [localQuery, setQuery]);

  const cartCount = items.length;

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-background text-foreground">
      <div className="mx-auto flex h-14 sm:h-18 max-w-full items-center justify-between gap-2 px-2 sm:px-4 md:px-6">
        <Link
          href="/shop"
          className=" hidden md:flex md:relative lg:relative h-10 w-10 sm:h-11 sm:w-28 md:w-32 lg:w-36 shrink-0"
        >
          <Image
            src="/Lakadel2.png"
            alt="Lakadel logo"
            fill
            priority
            className="object-contain"
          />
        </Link>
        <button onClick={toggleSidebar} className="p-2 md:hidden">
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-4">
          <div className="md:hidden w-full mr-2 flex flex-wrap justify-end">
            <button className="p-2">
              <Search />
            </button>

            <button
              className="relative rounded-full p-2"
              onClick={goToBag}
              disabled={isSyncing}
            >
              {cartCount > 0 && !isSyncing && (
                <span className="absolute right-0 top-0 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-foreground text-[9px] sm:text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}

              {isSyncing ? <Spinner w="5" h="5" /> : <ShoppingCart />}
            </button>

            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative rounded-full p-2 transition-all`}
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          {sidebarOpen && (
            <MobileSidebar
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
            />
          )}

          {notifOpen && (
            <div className="absolute right-0 mt-2">
              <UserNotificationDropdown setOpen={setNotifOpen} />
            </div>
          )}

          <div className="relative hidden md:flex min-w-0 flex-1 max-w-45 xs:max-w-[220px] sm:max-w-65 md:max-w-85 lg:max-w-105 items-center group">
            <IoSearchOutline className="absolute left-3 h-4 w-4 sm:h-5 sm:w-5 text-foreground/50 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full rounded-full border border-foreground/20 bg-background py-2 pl-9 pr-3 text-sm sm:pl-10 sm:pr-4 sm:text-base focus:outline-none focus:ring-2 focus:ring-foreground/50 transition-all duration-300"
            />
          </div>

          <div className="md:flex hidden shrink-0 items-center md:gap-1 gap-0 border-l border-foreground/20 pl-0 md:pl-2">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative rounded-full p-2 transition-all ${
                  notifOpen
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-rose-500 animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2">
                  <UserNotificationDropdown setOpen={setNotifOpen} />
                </div>
              )}
            </div>

            <button
              onClick={goToBag}
              className="relative rounded-full p-2 cursor-pointer hover:bg-foreground/10 transition-colors"
              aria-label="View Cart"
              disabled={isSyncing}
            >
              {cartCount > 0 && !isSyncing && (
                <span className="absolute right-0 top-0 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-foreground text-[9px] sm:text-[10px] font-bold text-background">
                  {cartCount}
                </span>
              )}

              {isSyncing ? (
                <Spinner w="5" h="5" />
              ) : (
                <IoBagOutline className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>

            <div className="relative" ref={menuRef}>
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile Image"
                  width={32}
                  height={32}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full cursor-pointer object-cover hover:bg-foreground/10 transition-colors"
                  onClick={() => setOpen((prev) => !prev)}
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                  }}
                  className="rounded-full p-2 cursor-pointer hover:bg-foreground/10 transition-colors"
                  aria-label="Profile Menu"
                >
                  <CgProfile className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}

              {open && (
                <div className="absolute right-0 mt-2">
                  <ProfileMenu setOpen={setOpen} open={open} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
