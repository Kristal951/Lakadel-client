import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="w-full h-screen grid md:grid-cols-2 grid-cols-1 bg-gray-50">
      <div className="flex flex-col justify-center items-center  dark:bg-gray-900">
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
