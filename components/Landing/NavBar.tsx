"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

import useProductStore from "@/store/productStore";
import useCartStore from "@/store/cartStore";
import ProfileMenu from "../ui/ProfileMenu";
import UserNotificationDropdown from "../shop/UserNotificationsDropDown";
import MobileSidebar from "./MobileSidebar";

const NAV_LINKS = [
  { label: "New In", href: "/shop?filter=new" },
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
];

type HeaderProps = {
  /** Transparent at the top of the page (landing hero). Set false for solid pages. */
  transparent?: boolean;
};

const Header = ({ transparent = true }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { items, isSyncing } = useCartStore();
  const { query, setQuery } = useProductStore();
  const cartCount = items.length;

  const [localQuery, setLocalQuery] = useState(query);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Solid background once scrolled, or whenever an overlay is open
  const solid = !transparent || scrolled || searchOpen || sidebarOpen;

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside + Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Debounced search -> store
  useEffect(() => {
    const t = setTimeout(() => setQuery(localQuery), 300);
    return () => clearTimeout(t);
  }, [localQuery, setQuery]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close overlays on route change
  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(localQuery);
    if (!pathname.startsWith("/shop")) router.push("/shop");
    setSearchOpen(false);
  };

  const iconBtn =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-foreground transition-all duration-300 ${
          solid
            ? "border-b border-foreground/10 bg-background/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Main"
          className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6"
        >
          {/* Left: mobile menu + logo */}
          <div className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
              className={`${iconBtn} z-50 md:hidden`}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* One logo: centered on mobile, left-aligned on desktop */}
            <Link
              href="/shop"
              aria-label="Lakadel home"
              className="absolute left-1/2 h-10 w-28 -translate-x-1/2 md:static md:w-32 md:translate-x-0"
            >
              <Image
                src="/Lakadel2.png"
                alt="Lakadel"
                fill
                priority
                sizes="128px"
                className="object-contain"
              />
            </Link>
          </div>

          {/* Center: desktop links */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href.split("?")[0] && href === "/shop";
              return (
                <li key={label}>
                  <Link
                    href={href}
                    className="group relative py-2 text-sm font-medium uppercase tracking-widest"
                  >
                    {label}
                    <span
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right: actions */}
          <div className="flex flex-1 items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Search products"
              aria-expanded={searchOpen}
              className={iconBtn}
            >
              <Search size={20} />
            </button>

            {/* {isLoggedIn && <UserNotificationDropdown />} */}

            {/* {isLoggedIn ? (
              <div ref={profileRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((p) => !p)}
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                  className={iconBtn}
                >
                  <UserRound size={20} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12">
                    <ProfileMenu />
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" aria-label="Log in" className={`${iconBtn} hidden sm:inline-flex`}>
                <UserRound size={20} />
              </Link>
            )} */}

            <Link
              href="/shopping-bag"
              aria-label={`Shopping bag, ${cartCount} items`}
              className={iconBtn}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background ${
                    isSyncing ? "animate-pulse" : ""
                  }`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Search panel */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
            searchOpen ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="mx-auto flex max-w-3xl items-center gap-3 px-4 pb-4"
          >
            <Search size={18} className="shrink-0 opacity-60" />
            <input
              ref={searchInputRef}
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search dresses, ankara, accessories..."
              className="w-full border-b border-foreground/30 bg-transparent py-2 text-base outline-none placeholder:text-foreground/50 focus:border-foreground"
            />
          </form>
        </div>
      </header>

      {sidebarOpen && (
        <MobileSidebar
          toggleSidebar={() => setSidebarOpen((p) => !p)}
          sidebarOpen={sidebarOpen}
        />
      )}
    </>
  );
};

export default Header;