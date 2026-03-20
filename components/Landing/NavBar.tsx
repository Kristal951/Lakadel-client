"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

const NavBar = () => {
  const navLinks = [
    { label: "Home", id: "home" },
    { label: "Products", id: "products" },
    { label: "About Us", id: "about" },
    { label: "Contact Us", id: "contact" },
  ];

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [activeID, setActiveID] = useState("Home");

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    setActiveID("Home");
    document.getElementById("home")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [setActiveID]);

  const handleScroll = (id: string, label: string) => {
    setActiveID(label);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent
        "
    >
      <div className="mx-auto flex w-full items-start md:items-center justify-between md:px-6 py-4 px-2 ">
        <div className="relative h-11 md:w-35 w-20">
          <Image
            src="/Lakadel2.png"
            alt="Lakadel logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        <div className="flex items-center md:gap-3">
          <button className="px-5 py-2 text-sm md:text-base cursor-pointer text-white rounded-full hover:bg-white/10 transition">
            Sign In
          </button>

          <Link
            href="/shop"
            className="md:px-6 md:py-2 p-2 text-sm md:text-base cursor-pointer md:rounded-full rounded-md font-semibold text-white
            bg-linear-to-r from-[#B10E0E] to-[#8E0B0B]
            hover:scale-[1.03] hover:shadow-lg transition-all"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
