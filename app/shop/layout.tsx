import Header from "@/components/shop/Header";
import SidebarFilters from "@/components/shop/Sidebar";
import React from "react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className="flex w-full flex-1">
        <Header />
        <SidebarFilters />
        <main className="flex-1 md:ml-[20%] mt-22 md:p-4 p-0">{children}</main>
      </div>
    </div>
  );
}
