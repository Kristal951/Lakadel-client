import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full h-screen grid md:grid-cols-2 relative grid-cols-1 bg-gray-50">
      <div className="flex flex-col justify-center items-center  dark:bg-gray-900 relative">
        <Link
          href="/shop"
          aria-label="Back to shop"
          className="inline-flex h-10 w-10 absolute top-6 right-6 items-center justify-center rounded-full transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        >
          <X size={20} />
        </Link>
        {children}
      </div>

      <div className="relative hidden md:block w-full bg-white h-full ">
        <Image
          src="/Lakadel2.png"
          alt="Lakadel Logo"
          fill
          priority
          className="object-contain"
        />
      </div>
    </div>
  );
}
