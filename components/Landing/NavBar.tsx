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
import { Menu, Search, X } from "lucide-react";
import UserNotificationDropdown from "../shop/UserNotificationsDropDown";
import MobileSidebar from "./MobileSidebar";

const Header = () => {
  const router = useRouter();

  const { items, isSyncing } = useCartStore();
  const { query, setQuery } = useProductStore();

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent text-foreground">
      <div className="mx-auto flex h-14 sm:h-18 max-w-full items-center justify-between gap-2 px-2 sm:px-4 md:px-6">
        
        <Link href="/shop" className="hidden md:flex relative h-10 w-32 shrink-0">
          <Image src="/Lakadel2.png" alt="Logo" fill priority className="object-contain" />
        </Link>

        <button onClick={toggleSidebar} className="p-2 md:hidden z-50">
          {sidebarOpen ? <X /> : <Menu />}
        </button>

        <div className="py-4 flex md:hidden flex-1 justify-center">
          <Link href="/shop" className="relative h-12 w-24 shrink-0">
            <Image src="/Lakadel2.png" alt="Logo" fill priority className="object-contain" />
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">

           {sidebarOpen && (
            <MobileSidebar
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
            />
          )}

          <div className="relative flex items-center group">
             <IoSearchOutline className="h-6 w-6 text-foreground cursor-pointer" />
          </div>

          <div className="flex shrink-0 items-center gap-1">
             <div className="relative" ref={menuRef}>
                {user?.image ? (
                  <Image 
                    src={user.image} 
                    alt="Profile" 
                    width={36} 
                    height={36} 
                    className="rounded-full cursor-pointer hover:ring-2 ring-foreground/20"
                    onClick={() => setOpen(!open)}
                  />
                ) : (
                  <button onClick={() => setOpen(!open)} className="p-2">
                    <CgProfile className="h-6 w-6" />
                  </button>
                )}
                {open && (
                  <div className="absolute right-0 mt-2 top-full">
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
