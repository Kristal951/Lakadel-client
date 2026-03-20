import NavBar from "@/components/Landing/NavBar";
import React from "react";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full w-full">
      <NavBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
